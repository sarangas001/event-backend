const bcrypt = require('bcryptjs');
const validator = require('validator');

const Faculty = require('../models/Faculty');
const Organization = require('../models/Organization');
const Venue = require('../models/Venue');
const User = require('../models/User');

const allowedSingleInstanceRoles = ['sportsDirector', 'chairmanOfArt', 'proctor', 'viceChancellor'];

const isWelfareOfficer = async (userId) => {
  const user = await User.findById(userId);
  return Boolean(user && user.adminProfile?.role === 'welfareOfficer');
};

const requireWelfareOfficer = async (req, res) => {
  const userId = req.body?.userId;
  const allowed = await isWelfareOfficer(userId);

  if (!allowed) {
    res.send({ success: false, message: 'Only the Welfare Officer can perform this action' });
    return false;
  }

  return true;
};

const parseDepartments = (departments) => {
  if (Array.isArray(departments)) {
    return departments.map((department) => String(department).trim()).filter(Boolean);
  }

  if (typeof departments === 'string') {
    return departments
      .split(',')
      .map((department) => department.trim())
      .filter(Boolean);
  }

  return [];
};

const hashPassword = async (password) => bcrypt.hash(password, 10);

const createFaculty = async (req, res) => {
  try {
    if (!(await requireWelfareOfficer(req, res))) {
      return;
    }

    const { facultyName, departments, deanId } = req.body;

    if (!facultyName?.trim()) {
      return res.send({ success: false, message: 'Missing Faculty Name' });
    }

    const normalizedDepartments = parseDepartments(departments);
    if (normalizedDepartments.length === 0) {
      return res.send({ success: false, message: 'Please provide at least one department' });
    }

    const existingFaculty = await Faculty.findOne({ facultyName: facultyName.trim() });
    if (existingFaculty) {
      return res.send({ success: false, message: 'Faculty already exists' });
    }

    let dean = null;
    if (deanId) {
      dean = await User.findById(deanId);
      if (!dean || dean.adminProfile?.role !== 'dean') {
        return res.send({ success: false, message: 'Invalid dean reference' });
      }

      if (dean.adminProfile?.faculty) {
        return res.send({ success: false, message: 'Dean is already linked to another faculty' });
      }
    }

    const faculty = new Faculty({
      facultyName: facultyName.trim(),
      departments: normalizedDepartments,
      dean: dean ? dean._id : null,
    });

    const savedFaculty = await faculty.save();

    if (dean) {
      dean.adminProfile = {
        ...(dean.adminProfile || {}),
        role: 'dean',
        faculty: savedFaculty._id,
      };
      await dean.save();
    }

    return res.send({ success: true, message: savedFaculty });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const createDean = async (req, res) => {
  try {
    if (!(await requireWelfareOfficer(req, res))) {
      return;
    }

    const { fullName, facultyId, email, password } = req.body;

    if (!fullName?.trim()) {
      return res.send({ success: false, message: 'Missing Dean Name' });
    }

    if (!facultyId) {
      return res.send({ success: false, message: 'Missing Faculty' });
    }

    if (!email || !validator.isEmail(email)) {
      return res.send({ success: false, message: 'Invalid Email' });
    }

    if (!password) {
      return res.send({ success: false, message: 'Missing Password' });
    }

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.send({ success: false, message: 'Faculty not found' });
    }

    if (faculty.dean) {
      return res.send({ success: false, message: 'This faculty already has a dean' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const dean = new User({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      adminProfile: {
        role: 'dean',
        faculty: faculty._id,
      },
    });

    const savedDean = await dean.save();

    faculty.dean = savedDean._id;
    await faculty.save();

    return res.send({ success: true, message: savedDean });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const createVenue = async (req, res) => {
  try {
    if (!(await requireWelfareOfficer(req, res))) {
      return;
    }

    const { venueName, capacity, type, ownerType, facultyId } = req.body;


    if (!venueName?.trim()) {
      return res.send({ success: false, message: 'Missing Venue Name' });
    }

    const numericCapacity = Number(capacity);
    if (!Number.isFinite(numericCapacity) || numericCapacity <= 0) {
      return res.send({ success: false, message: 'Invalid Capacity' });
    }

    if (!type?.trim()) {
      return res.send({ success: false, message: 'Missing Venue Type' });
    }
    console.log('Owner Type:', ownerType);
    if (!ownerType || !['Welfare', 'Dean', 'Sports Director'].includes(ownerType)) {
      return res.send({ success: false, message: 'Invalid Ownership / Authority' });
    }

    // const venueOwner = ownerRef ? await User.findById(ownerRef) : null;
    const venueOwner = await User.findOne({ "adminProfile.role": ownerType === 'Welfare' ? 'welfareOfficer' : ownerType === 'Dean' ? 'dean' : 'sportsDirector' });

    const ownerRef = venueOwner ? venueOwner._id : null;
    if (ownerRef && !venueOwner) {
      return res.send({ success: false, message: 'Venue owner not found' });
    }

    if (ownerType === 'Dean') {
      if (!ownerRef && !facultyId) {
        return res.send({ success: false, message: 'Dean-owned venues require a dean or faculty reference' });
      }

      if (venueOwner && venueOwner.adminProfile?.role !== 'dean') {
        return res.send({ success: false, message: 'Venue owner must be a dean' });
      }
    }

    if (ownerType === 'Sports Director' && venueOwner && venueOwner.adminProfile?.role !== 'sportsDirector') {
      return res.send({ success: false, message: 'Venue owner must be a sports director' });
    }

    if (ownerType === 'Welfare' && venueOwner && venueOwner.adminProfile?.role !== 'welfareOfficer') {
      return res.send({ success: false, message: 'Venue owner must be a welfare officer' });
    }

    const duplicateVenue = await Venue.findOne({ venueName: venueName.trim() });
    if (duplicateVenue) {
      return res.send({ success: false, message: 'Venue already exists' });
    }



    const venue = new Venue({
      venueName: venueName.trim(),
      capacity: numericCapacity,
      type: type.trim(),
      ownerType,
      ownerRef: venueOwner ? venueOwner._id : null,
      faculty: facultyId || null,
    });

    const savedVenue = await venue.save();

    return res.send({ success: true, message: savedVenue });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const createAdvisor = async (req, res) => {
  try {
    if (!(await requireWelfareOfficer(req, res))) {
      return;
    }

    const { fullName, email, password, organizationId } = req.body;

    if (!fullName?.trim()) {
      return res.send({ success: false, message: 'Missing Advisor Name' });
    }

    if (!email || !validator.isEmail(email)) {
      return res.send({ success: false, message: 'Invalid Email' });
    }

    if (!password) {
      return res.send({ success: false, message: 'Missing Password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const advisor = new User({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      adminProfile: {
        role: 'advisor',
        organization: organizationId || null,
      },
    });

    const savedAdvisor = await advisor.save();

    if (organizationId) {
      await Organization.findByIdAndUpdate(organizationId, {
        advisor: savedAdvisor._id,
        authorityType: 'advisor',
        authorityRef: savedAdvisor._id,
      });
    }

    return res.send({ success: true, message: savedAdvisor });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const createOrganization = async (req, res) => {
  try {
    if (!(await requireWelfareOfficer(req, res))) {
      return;
    }

    const {
      organizationName,
      organizationType,
      advisorId,
      facultyId,
      presidentName,
      email,
      projectCount,
    } = req.body;

    if (!organizationName?.trim()) {
      return res.send({ success: false, message: 'Missing Organization Name' });
    }

    if (!organizationType || !['noFaculty', 'withFaculty'].includes(organizationType)) {
      return res.send({ success: false, message: 'Invalid Organization Type' });
    }

    if (!email || !validator.isEmail(email)) {
      return res.send({ success: false, message: 'Invalid Email' });
    }

    const existingOrganization = await Organization.findOne({
      organizationName: organizationName.trim(),
    });

    if (existingOrganization) {
      return res.send({ success: false, message: 'Organization already exists' });
    }

    let faculty = null;
    let advisor = null;
    let authorityRef = null;
    let authorityType = 'advisor';

    if (organizationType === 'noFaculty') {
      if (!advisorId) {
        return res.send({ success: false, message: 'Advisor is required for no-faculty organizations' });
      }

      advisor = await User.findById(advisorId);
      if (!advisor || advisor.adminProfile?.role !== 'advisor') {
        return res.send({ success: false, message: 'Invalid advisor reference' });
      }

      authorityRef = advisor._id;
    }

    if (organizationType === 'withFaculty') {
      if (!facultyId) {
        return res.send({ success: false, message: 'Faculty is required for faculty-connected organizations' });
      }

      faculty = await Faculty.findById(facultyId).populate('dean');
      if (!faculty) {
        return res.send({ success: false, message: 'Faculty not found' });
      }

      if (!faculty.dean) {
        return res.send({ success: false, message: 'Faculty-connected organizations require the faculty to already have a dean' });
      }

      authorityType = 'dean';
      authorityRef = faculty.dean._id;
    }

    const organization = new Organization({
      organizationName: organizationName.trim(),
      organizationType,
      faculty: faculty?._id || null,
      advisor: advisor?._id || null,
      presidentName: presidentName?.trim() || '',
      email: email.trim().toLowerCase(),
      projectCount: Number.isFinite(Number(projectCount)) ? Number(projectCount) : 0,
      authorityType,
      authorityRef,
    });

    const savedOrganization = await organization.save();

    if (advisor) {
      advisor.adminProfile = {
        ...(advisor.adminProfile || {}),
        organization: savedOrganization._id,
      };
      await advisor.save();
    }

    if (organizationType === 'withFaculty' && faculty?.dean) {
      const deanUser = await User.findById(faculty.dean._id);
      if (deanUser) {
        deanUser.adminProfile = {
          ...(deanUser.adminProfile || {}),
          organization: savedOrganization._id,
        };
        await deanUser.save();
      }
    }

    return res.send({ success: true, message: savedOrganization });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const createUniversityRole = async (req, res) => {
  try {
    if (!(await requireWelfareOfficer(req, res))) {
      return;
    }

    const { fullName, email, password, role } = req.body;

    if (!fullName?.trim()) {
      return res.send({ success: false, message: 'Missing Name' });
    }

    if (!email || !validator.isEmail(email)) {
      return res.send({ success: false, message: 'Invalid Email' });
    }

    if (!password) {
      return res.send({ success: false, message: 'Missing Password' });
    }

    if (!allowedSingleInstanceRoles.includes(role)) {
      return res.send({ success: false, message: 'Invalid role selection' });
    }

    const existingRoleUser = await User.findOne({ 'adminProfile.role': role });
    if (existingRoleUser) {
      return res.send({ success: false, message: `There is already a user assigned as ${role}` });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      adminProfile: {
        role,
      },
    });

    const savedUser = await user.save();

    return res.send({ success: true, message: savedUser });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const getAdminCatalog = async (req, res) => {
  try {
    if (!(await requireWelfareOfficer(req, res))) {
      return;
    }

    const [faculties, venues, organizations, admins] = await Promise.all([
      Faculty.find().populate('dean', 'fullName email adminProfile'),
      Venue.find().populate('ownerRef', 'fullName email adminProfile'),
      Organization.find().populate('faculty').populate('advisor', 'fullName email adminProfile').populate('authorityRef', 'fullName email adminProfile'),
      User.find({ 'adminProfile.role': { $in: allowedSingleInstanceRoles } }).select('fullName email adminProfile'),
    ]);

    const [advisors, deans, welfareOfficer] = await Promise.all([
      User.find({ 'adminProfile.role': 'advisor' }).select('fullName email adminProfile'),
      User.find({ 'adminProfile.role': 'dean' }).select('fullName email adminProfile'),
      User.findOne({ 'adminProfile.role': 'welfareOfficer' }).select('fullName email adminProfile'),
    ]);

    return res.send({
      success: true,
      message: {
        faculties,
        venues,
        organizations,
        adminRoles: admins,
        advisors,
        deans,
        welfareOfficer,
      },
    });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find().populate('ownerRef', 'fullName email adminProfile');

    return res.send({ success: true, message: venues });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

module.exports = {
  createAdvisor,
  createDean,
  createFaculty,
  createOrganization,
  createUniversityRole,
  createVenue,
  getAdminCatalog,
  getVenues,
};
