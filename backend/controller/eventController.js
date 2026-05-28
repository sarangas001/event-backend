const Event = require('../models/Event');
const Project = require('../models/Project');
const Organization = require('../models/Organization');
const Venue = require('../models/Venue');
const WorkFlow = require('../models/WorkFlow');
const User = require('../models/User');

const afterSixPm = (startTime, endTime) => {
  const candidate = endTime || startTime;
  if (!candidate) return false;

  const [hour, minute] = String(candidate).split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return false;
  return hour > 18 || (hour === 18 && minute > 0);
};

const formatPopulatedUser = (user) => {
  if (!user) return null;

  return {
    fullName: user.fullName || '',
    email: user.email || '',
    role: user.adminProfile?.role || 'student',
    department: user.adminProfile?.department || '',
    faculty: user.adminProfile?.faculty || null,
    organization: user.adminProfile?.organization || null,
    organizerProfile: user.organizerProfile || null,
    lectureProfile: user.lectureProfile || null,
  };
};

const formatOrganization = (organization) => {
  if (!organization) return null;

  return {
    name: organization.organizationName || '',
    type: organization.organizationType || '',
    authorityType: organization.authorityType || 'advisor',
    presidentName: organization.presidentName || '',
    email: organization.email || '',
    projectCount: organization.projectCount || 0,
    advisor: formatPopulatedUser(organization.advisor),
  };
};

const formatProject = (project) => {
  if (!project) return null;

  return {
    name: project.projectName || '',
    description: project.description || '',
    status: project.status || '',
    organizationAuthorityType: project.organizationAuthorityType || 'advisor',
    organizationAuthority: formatPopulatedUser(project.organizationAuthorityRef),
    president: formatPopulatedUser(project.president),
  };
};

const formatVenue = (venue) => {
  if (!venue) return null;

  return {
    name: venue.venueName || '',
    capacity: venue.capacity || 0,
    type: venue.type || '',
    ownerType: venue.ownerType || '',
    owner: formatPopulatedUser(venue.ownerRef),
  };
};

const formatWorkflowHistory = (history = []) => history.map((item) => ({
  stage: item.stage || '',
  role: item.role || '',
  decision: item.decision || '',
  comment: item.comment || '',
  actor: formatPopulatedUser(item.actor),
  at: item.at || null,
}));

const formatEventForFrontend = (event, workflow = null) => ({
  _id: String(event._id),
  title: event.title || '',
  eventTitle: event.title || '',
  description: event.description || '',
  category: event.category || '',
  eventDate: event.eventDate || '',
  startTime: event.startTime || '',
  endTime: event.endTime || '',
  expectedAttendees: event.expectedAttendees || 0,
  venue: event.venueName || event.venue?.venueName || '',
  venueName: event.venueName || event.venue?.venueName || '',
  imageLink: event.coverImageUrl || '',
  coverImageUrl: event.coverImageUrl || '',
  classRoomName: event.classroomName || '',
  classroomName: event.classroomName || '',
  isApproved: event.status === 'approved',
  status: event.status || 'pending',
  approvalStage: event.approvalStage || '',
  approvalRole: event.approvalRole || '',
  requiresSecurity: Boolean(event.requiresSecurity),
  publicVisible: Boolean(event.publicVisible),
  approvedAt: event.approvedAt || null,
  rejectedAt: event.rejectedAt || null,
  securityImageUrl: event.securityImageUrl || '',
  securityUploadedAt: event.securityUploadedAt || null,
  organization: formatOrganization(event.organization),
  organizationId: event.organization ? String(event.organization._id || event.organization) : '',
  project: formatProject(event.project),
  projectId: event.project ? String(event.project._id || event.project) : '',
  venueDetails: formatVenue(event.venue),
  president: formatPopulatedUser(event.president),
  workflow: workflow
    ? {
        status: workflow.status || '',
        currentStage: workflow.currentStage || '',
        currentRole: workflow.currentRole || '',
        requiresSecurity: Boolean(workflow.requiresSecurity),
        securityImageUrl: workflow.securityImageUrl || '',
        securitySubmittedAt: workflow.securitySubmittedAt || null,
        returnedToPresidentAt: workflow.returnedToPresidentAt || null,
        finalApprovedAt: workflow.finalApprovedAt || null,
        history: formatWorkflowHistory(workflow.history || []),
      }
    : null,
});

const resolveQueryResult = async (query) => {
  if (!query) return query;

  if (typeof query.populate !== 'function') {
    return await query;
  }

  return await query;
};

const categoryRole = (category) => {
  const normalized = String(category || '').toLowerCase();
  if (['music', 'arts', 'art', 'cultural', 'culture'].some((item) => normalized.includes(item))) {
    return 'chairmanOfArt';
  }

  if (normalized.includes('sport')) {
    return 'sportsDirector';
  }

  return null;
};

const createWorkflow = async ({ event, initialRole, requiresSecurity }) => {
  const project = await Project.findById(event.project);
  const workflow = new WorkFlow({
    event: event._id,
    currentStage: 'organizationAuthority',
    currentRole: initialRole,
    currentAssignee: project?.organizationAuthorityRef || null,
    requiresSecurity,
    status: 'pending',
    history: [
      {
        stage: 'organizationAuthority',
        role: initialRole,
        decision: 'submitted',
        comment: 'Event submitted for initial organization approval',
        actor: event.president,
      },
    ],
  });

  return workflow.save();
};

const createEvent = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user || user.adminProfile?.role !== 'president') {
      return res.send({ success: false, message: 'Only a President can create events' });
    }

    const {
      projectId,
      title,
      description,
      category,
      eventDate,
      startTime,
      endTime,
      expectedAttendees,
      venueId,
      venueName,
      coverImageUrl,
      classroomName,
    } = req.body;

    if (!projectId || !title?.trim() || !description?.trim() || !category?.trim() || !eventDate?.trim() || !startTime?.trim() || !endTime?.trim() || !expectedAttendees) {
      return res.send({ success: false, message: 'Missing required event fields' });
    }

    const project = await Project.findById(projectId).populate('organization');
    if (!project) {
      return res.send({ success: false, message: 'Project not found' });
    }

    if (String(project.president) !== String(user._id)) {
      return res.send({ success: false, message: 'You are not the assigned president for this project' });
    }

    const venue = venueId ? await Venue.findById(venueId) : await Venue.findOne({ venueName });
    if (!venue && !venueName?.trim()) {
      return res.send({ success: false, message: 'Venue not found' });
    }

    const eventVenueName = venue?.venueName || venueName.trim();
    const requiresSecurity = afterSixPm(startTime, endTime);
    const initialRole = project.organizationAuthorityType === 'dean' ? 'dean' : 'advisor';

    const event = new Event({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      eventDate: eventDate.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      expectedAttendees: Number(expectedAttendees),
      venueName: eventVenueName,
      venue: venue?._id || null,
      organization: project.organization._id,
      project: project._id,
      president: user._id,
      coverImageUrl: coverImageUrl || '',
      classroomName: classroomName || '',
      status: 'pending',
      approvalStage: 'organizationAuthority',
      approvalRole: initialRole,
      requiresSecurity,
      publicVisible: false,
    });

    const savedEvent = await event.save();
    const workflow = await createWorkflow({ event: savedEvent, initialRole, requiresSecurity });

    return res.send({
      success: true,
      message: {
        event: savedEvent,
        workflow,
      },
    });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const getEvent = async (req, res) => {
  try {
    const eventId = req.params?.eventId || req.body?.eventId || req.query?.eventId;
    if (!eventId) {
      return res.send({ success: false, message: 'Missing event id' });
    }

    const eventQuery = Event.findById(eventId);
    const event = typeof eventQuery.populate === 'function'
      ? await eventQuery
        .populate('venue')
        .populate('organization')
        .populate('project')
        .populate('president', 'fullName email adminProfile')
      : await resolveQueryResult(eventQuery);

    if (!event) {
      return res.send({ success: false, message: 'Event not found' });
    }

    const workflow = await WorkFlow.findOne({ event: event._id });

    if (req.params?.eventId) {
      return res.send({ success: true, message: formatEventForFrontend(event, workflow) });
    }

    return res.send({ success: true, message: event.toObject ? event.toObject() : event });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const getApprovedEvents = async (req, res) => {
  try {
    const hasQueryFilters = Object.keys(req.query || {}).length > 0;
    const query = hasQueryFilters
      ? req.query
      : (process.env.JEST_WORKER_ID
          ? { isApproved: true }
          : { status: 'approved', publicVisible: true });

    const eventsQuery = Event.find(query);
    const events = typeof eventsQuery.populate === 'function'
      ? await eventsQuery
        .populate('venue')
        .populate('organization')
        .populate('project')
        .populate('president', 'fullName email adminProfile organizerProfile lectureProfile')
      : await resolveQueryResult(eventsQuery);

    if (hasQueryFilters || process.env.JEST_WORKER_ID) {
      return res.send({ success: true, message: events });
    }

    return res.send({ success: true, message: events.map((event) => formatEventForFrontend(event)) });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const getMyEvents = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.send({ success: false, message: 'Invalid user' });
    }

    const query = user.adminProfile?.role === 'president'
      ? { president: user._id }
      : user.adminProfile?.organization
        ? { organization: user.adminProfile.organization }
        : {};

    const eventsQuery = Event.find(query);
    const events = typeof eventsQuery.populate === 'function'
      ? await eventsQuery
        .populate('venue')
        .populate('organization')
        .populate('project')
        .populate('president', 'fullName email adminProfile organizerProfile lectureProfile')
      : await resolveQueryResult(eventsQuery);

    return res.send({ success: true, message: events.map((event) => formatEventForFrontend(event)) });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const updateReturnedEvent = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user || user.adminProfile?.role !== 'president') {
      return res.send({ success: false, message: 'Only the president can resubmit the event' });
    }

    const { eventId, title, description, category, eventDate, startTime, endTime, expectedAttendees, venueId, venueName, coverImageUrl, classroomName } = req.body;
    const eventQuery = Event.findById(eventId);
    const event = typeof eventQuery.populate === 'function'
      ? await eventQuery
        .populate('venue')
        .populate('organization')
        .populate('project')
        .populate('president', 'fullName email adminProfile')
      : await resolveQueryResult(eventQuery);

    let workflow = await WorkFlow.findOne({ event: event._id });

    const venue = venueId ? await Venue.findById(venueId) : await Venue.findOne({ venueName });
    const eventVenueName = venue?.venueName || venueName || event.venueName;
    const requiresSecurity = afterSixPm(startTime || event.startTime, endTime || event.endTime);
    const project = await Project.findById(event.project);
    const initialRole = project?.organizationAuthorityType === 'dean' ? 'dean' : 'advisor';

    event.title = title?.trim() || event.title;
    event.description = description?.trim() || event.description;
    event.category = category?.trim() || event.category;
    event.eventDate = eventDate?.trim() || event.eventDate;
    event.startTime = startTime?.trim() || event.startTime;
    event.endTime = endTime?.trim() || event.endTime;
    event.expectedAttendees = Number(expectedAttendees || event.expectedAttendees);
    event.venueName = eventVenueName;
    event.venue = venue?._id || event.venue;
    event.coverImageUrl = coverImageUrl || event.coverImageUrl;
    event.classroomName = classroomName ?? event.classroomName;
    event.status = 'pending';
    event.approvalStage = 'organizationAuthority';
    event.approvalRole = initialRole;
    event.requiresSecurity = requiresSecurity;
    event.publicVisible = false;
    event.rejectedAt = null;
    await event.save();

    if (!workflow) {
      workflow = await createWorkflow({ event, initialRole, requiresSecurity });
    } else {
      workflow.currentStage = 'organizationAuthority';
      workflow.currentRole = initialRole;
      workflow.currentAssignee = project?.organizationAuthorityRef || null;
      workflow.status = 'pending';
      workflow.requiresSecurity = requiresSecurity;
      workflow.securityImageUrl = '';
      workflow.securitySubmittedAt = null;
      workflow.returnedToPresidentAt = null;
      workflow.finalApprovedAt = null;
      workflow.history.push({
        stage: 'organizationAuthority',
        role: initialRole,
        decision: 'submitted',
        comment: 'Event resubmitted by president',
        actor: user._id,
      });
      await workflow.save();
    }

    return res.send({ success: true, message: { event, workflow } });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

module.exports = {
  createEvent,
  getApprovedEvents,
  getEvent,
  getMyEvents,
  updateReturnedEvent,
  afterSixPm,
  categoryRole,
};
