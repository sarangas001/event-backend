const Event = require('../models/Event');
const Project = require('../models/Project');
const User = require('../models/User');
const Venue = require('../models/Venue');
const WorkFlow = require('../models/WorkFlow');
const { categoryRole, afterSixPm } = require('./eventController');

const formatPopulatedUser = (user) => {
  if (!user) return null;

  return {
    fullName: user.fullName || '',
    email: user.email || '',
    role: user.adminProfile?.role || 'student',
    department: user.adminProfile?.department || '',
    organization: user.adminProfile?.organization || null,
    organizerProfile: user.organizerProfile || null,
    lectureProfile: user.lectureProfile || null,
  };
};

const formatWorkflowDetail = (workflow) => ({
  status: workflow.status || '',
  currentStage: workflow.currentStage || '',
  currentRole: workflow.currentRole || '',
  requiresSecurity: Boolean(workflow.requiresSecurity),
  securityImageUrl: workflow.securityImageUrl || '',
  securitySubmittedAt: workflow.securitySubmittedAt || null,
  returnedToPresidentAt: workflow.returnedToPresidentAt || null,
  finalApprovedAt: workflow.finalApprovedAt || null,
  history: (workflow.history || []).map((item) => ({
    stage: item.stage || '',
    role: item.role || '',
    decision: item.decision || '',
    comment: item.comment || '',
    at: item.at || null,
    actor: formatPopulatedUser(item.actor),
  })),
});

const formatEventDetail = (event) => ({
  title: event.title || '',
  description: event.description || '',
  category: event.category || '',
  eventDate: event.eventDate || '',
  startTime: event.startTime || '',
  endTime: event.endTime || '',
  expectedAttendees: event.expectedAttendees || 0,
  venueName: event.venueName || event.venue?.venueName || '',
  coverImageUrl: event.coverImageUrl || '',
  classroomName: event.classroomName || '',
  status: event.status || '',
  approvalStage: event.approvalStage || '',
  approvalRole: event.approvalRole || '',
  requiresSecurity: Boolean(event.requiresSecurity),
  publicVisible: Boolean(event.publicVisible),
  approvedAt: event.approvedAt || null,
  rejectedAt: event.rejectedAt || null,
});

const formatOrganizationDetail = (organization) => ({
  name: organization.organizationName || '',
  type: organization.organizationType || '',
  authorityType: organization.authorityType || 'advisor',
  presidentName: organization.presidentName || '',
  email: organization.email || '',
  projectCount: organization.projectCount || 0,
});

const formatProjectDetail = (project) => ({
  name: project.projectName || '',
  description: project.description || '',
  status: project.status || '',
  organizationAuthorityType: project.organizationAuthorityType || 'advisor',
  organizationAuthority: formatPopulatedUser(project.organizationAuthorityRef),
  president: formatPopulatedUser(project.president),
});

const formatVenueDetail = (venue) => ({
  name: venue.venueName || '',
  capacity: venue.capacity || 0,
  type: venue.type || '',
  ownerType: venue.ownerType || '',
  owner: formatPopulatedUser(venue.ownerRef),
});

const getSingleRoleUser = async (role) => User.findOne({ 'adminProfile.role': role });

const resolveCurrentAssignee = async (event, workflow, currentStage) => {
  const project = await Project.findById(event.project).populate('organization');
  const venue = event.venue ? await Venue.findById(event.venue) : await Venue.findOne({ venueName: event.venueName });
  const categoryTarget = categoryRole(event.category);

  if (currentStage === 'organizationAuthority') {
    return project?.organizationAuthorityRef || null;
  }

  if (currentStage === 'welfareOfficer') {
    return getSingleRoleUser('welfareOfficer').then((user) => user?._id || null);
  }

  if (currentStage === 'venueOwner') {
    return venue?.ownerRef || null;
  }

  if (currentStage === 'categoryCheck') {
    if (!categoryTarget) return null;
    const user = await getSingleRoleUser(categoryTarget);
    return user?._id || null;
  }

  if (currentStage === 'securityUpload') {
    return event.president;
  }

  if (currentStage === 'proctor') {
    const user = await getSingleRoleUser('proctor');
    return user?._id || null;
  }

  if (currentStage === 'viceChancellor') {
    const user = await getSingleRoleUser('viceChancellor');
    return user?._id || null;
  }

  if (currentStage === 'welfareFinal') {
    const user = await getSingleRoleUser('welfareOfficer');
    return user?._id || null;
  }

  return workflow.currentAssignee || null;
};

const getNextStage = async (event, workflow) => {
  const venue = event.venue ? await Venue.findById(event.venue) : await Venue.findOne({ venueName: event.venueName });
  const categoryTarget = categoryRole(event.category);

  switch (workflow.currentStage) {
    case 'organizationAuthority':
      return { stage: 'welfareOfficer' };
    case 'welfareOfficer':
      if (venue?.ownerType && venue.ownerType !== 'Welfare') {
        return { stage: 'venueOwner' };
      }
      if (categoryTarget) {
        return { stage: 'categoryCheck' };
      }
      if (workflow.requiresSecurity) {
        return { stage: 'securityUpload' };
      }
      return { stage: 'proctor' };
    case 'venueOwner':
      if (categoryTarget) {
        return { stage: 'categoryCheck' };
      }
      if (workflow.requiresSecurity) {
        return { stage: 'securityUpload' };
      }
      return { stage: 'proctor' };
    case 'categoryCheck':
      if (workflow.requiresSecurity) {
        return { stage: 'securityUpload' };
      }
      return { stage: 'proctor' };
    case 'securityUpload':
      return { stage: 'proctor' };
    case 'proctor':
      return { stage: 'viceChancellor' };
    case 'viceChancellor':
      return { stage: 'welfareFinal' };
    case 'welfareFinal':
      return { stage: 'approved' };
    default:
      return { stage: workflow.currentStage };
  }
};

const roleForStage = async (event, stage) => {
  const venue = event.venue ? await Venue.findById(event.venue) : await Venue.findOne({ venueName: event.venueName });
  const categoryTarget = categoryRole(event.category);

  if (stage === 'organizationAuthority') {
    const project = await Project.findById(event.project);
    return project?.organizationAuthorityType || 'advisor';
  }

  if (stage === 'welfareOfficer') return 'welfareOfficer';
  if (stage === 'venueOwner') {
    if (!venue) return null;
    if (venue.ownerType === 'Dean') return 'dean';
    if (venue.ownerType === 'Sports Director') return 'sportsDirector';
    return 'welfareOfficer';
  }
  if (stage === 'categoryCheck') return categoryTarget;
  if (stage === 'securityUpload') return 'president';
  if (stage === 'proctor') return 'proctor';
  if (stage === 'viceChancellor') return 'viceChancellor';
  if (stage === 'welfareFinal') return 'welfareOfficer';
  return null;
};

const getWorkflowQueue = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.send({ success: false, message: 'Invalid user' });
    }

    const workflows = await WorkFlow.find({
      status: 'pending',
      currentRole: user.adminProfile?.role,
    }).populate({
      path: 'event',
      populate: [
        { path: 'organization' },
        { path: 'project' },
        { path: 'venue' },
        { path: 'president' },
      ],
    });

    const visibleWorkflows = workflows.filter((workflow) => {
      if (!workflow.currentAssignee) return true;
      return String(workflow.currentAssignee) === String(user._id);
    });

    return res.send({ success: true, message: visibleWorkflows });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const updateWorkflowStatus = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.send({ success: false, message: 'Invalid user' });
    }

    const { eventId, status, comment = '' } = req.body;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.send({ success: false, message: 'Event not found' });
    }

    const workflow = await WorkFlow.findOne({ event: event._id });
    if (!workflow) {
      return res.send({ success: false, message: 'Workflow not found' });
    }

    if (workflow.currentRole !== user.adminProfile?.role) {
      return res.send({ success: false, message: 'You are not the assigned reviewer for this step' });
    }

    if (workflow.currentAssignee && String(workflow.currentAssignee) !== String(user._id)) {
      return res.send({ success: false, message: 'This workflow item is assigned to another user' });
    }

    if (workflow.currentStage === 'securityUpload') {
      return res.send({ success: false, message: 'Use the security upload endpoint for this step' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.send({ success: false, message: 'Invalid workflow decision' });
    }

    workflow.history.push({
      stage: workflow.currentStage,
      role: workflow.currentRole,
      decision: status,
      comment,
      actor: user._id,
    });

    if (status === 'rejected') {
      workflow.status = 'returned';
      workflow.currentStage = 'returnedToPresident';
      workflow.currentRole = 'president';
      workflow.currentAssignee = event.president;
      workflow.returnedToPresidentAt = new Date();
      event.status = 'returned';
      event.approvalStage = 'returnedToPresident';
      event.approvalRole = 'president';
      event.publicVisible = false;
      event.rejectedAt = new Date();
      await event.save();
      await workflow.save();
      return res.send({ success: true, message: workflow });
    }

    const next = await getNextStage(event, workflow);
    const nextRole = await roleForStage(event, next.stage);
    const nextAssignee = await resolveCurrentAssignee(event, workflow, next.stage);

    workflow.currentStage = next.stage;
    workflow.currentRole = nextRole || workflow.currentRole;
    workflow.currentAssignee = nextAssignee;

    if (next.stage === 'approved') {
      workflow.status = 'approved';
      workflow.finalApprovedAt = new Date();
      event.status = 'approved';
      event.approvalStage = 'approved';
      event.approvalRole = 'welfareOfficer';
      event.publicVisible = true;
      event.approvedAt = new Date();
      await event.save();
    } else if (next.stage === 'securityUpload') {
      workflow.currentRole = 'president';
      workflow.currentAssignee = event.president;
      event.approvalStage = 'securityUpload';
      event.approvalRole = 'president';
      await event.save();
    } else {
      event.approvalStage = next.stage;
      event.approvalRole = nextRole || event.approvalRole;
      await event.save();
    }

    await workflow.save();
    return res.send({ success: true, message: workflow });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const submitSecurityProof = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user || user.adminProfile?.role !== 'president') {
      return res.send({ success: false, message: 'Only the president can submit security proof' });
    }

    const { eventId, imageUrl } = req.body;
    if (!eventId || !imageUrl?.trim()) {
      return res.send({ success: false, message: 'Missing security image' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.send({ success: false, message: 'Event not found' });
    }

    if (String(event.president) !== String(user._id)) {
      return res.send({ success: false, message: 'You are not the owner of this event' });
    }

    const workflow = await WorkFlow.findOne({ event: event._id });
    if (!workflow || workflow.currentStage !== 'securityUpload') {
      return res.send({ success: false, message: 'Security upload is not required at this stage' });
    }

    workflow.securityImageUrl = imageUrl.trim();
    workflow.securitySubmittedAt = new Date();
    workflow.history.push({
      stage: 'securityUpload',
      role: 'president',
      decision: 'uploaded',
      comment: 'Security signatures submitted',
      actor: user._id,
    });

    const nextAssignee = await resolveCurrentAssignee(event, workflow, 'proctor');
    workflow.currentStage = 'proctor';
    workflow.currentRole = 'proctor';
    workflow.currentAssignee = nextAssignee;
    await workflow.save();

    event.securityImageUrl = imageUrl.trim();
    event.securityUploadedAt = new Date();
    event.approvalStage = 'proctor';
    event.approvalRole = 'proctor';
    await event.save();

    return res.send({ success: true, message: workflow });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const getWorkflowByOrganizer = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.send({ success: false, message: 'Invalid user' });
    }

    const { eventId } = req.body;
    const workflow = await WorkFlow.findOne({ event: eventId }).populate({
      path: 'event',
      populate: [
        { path: 'organization' },
        { path: 'project' },
        { path: 'venue' },
        { path: 'president' },
      ],
    });

    if (!workflow) {
      return res.send({ success: false, message: 'Workflow not found' });
    }

    return res.send({ success: true, message: workflow });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const getWorkflowEventDetails = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.send({ success: false, message: 'Invalid user' });
    }

    const eventId = req.params?.eventId || req.body?.eventId || req.query?.eventId;
    if (!eventId) {
      return res.send({ success: false, message: 'Missing event id' });
    }

    const workflow = await WorkFlow.findOne({ event: eventId }).populate({
      path: 'event',
      populate: [
        { path: 'organization' },
        { path: 'project' },
        { path: 'venue' },
        { path: 'president' },
      ],
    });

    if (!workflow) {
      return res.send({ success: false, message: 'Workflow not found' });
    }

    const event = workflow.event;

    return res.send({
      success: true,
      message: {
        event: formatEventDetail(event),
        relations: {
          organization: formatOrganizationDetail(event.organization),
          project: formatProjectDetail(event.project),
          venue: formatVenueDetail(event.venue),
          president: formatPopulatedUser(event.president),
        },
        workflow: formatWorkflowDetail(workflow),
      },
    });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

module.exports = {
  getWorkflowQueue,
  updateWorkflowStatus,
  submitSecurityProof,
  getWorkflowByOrganizer,
  getWorkflowEventDetails,
};
