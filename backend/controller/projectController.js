const bcrypt = require('bcryptjs');
const validator = require('validator');

const Organization = require('../models/Organization');
const Project = require('../models/Project');
const User = require('../models/User');

const createProject = async (req, res) => {
  try {
    const {
      organizationId,
      projectName,
      description,
      presidentName,
      presidentEmail,
      presidentPassword,
    } = req.body;

    const currentUser = await User.findById(req.body.userId);
    if (!currentUser) {
      return res.send({ success: false, message: 'Invalid user' });
    }

    if (!['advisor', 'dean'].includes(currentUser.adminProfile?.role)) {
      return res.send({ success: false, message: 'Only an Advisor or Dean can create a project' });
    }

    const resolvedOrganizationId = organizationId || currentUser.adminProfile?.organization;

    if (!resolvedOrganizationId) {
      return res.send({ success: false, message: 'Missing Organization' });
    }

    if (!projectName?.trim()) {
      return res.send({ success: false, message: 'Missing Project Name' });
    }

    if (!description?.trim()) {
      return res.send({ success: false, message: 'Missing Description' });
    }

    if (!presidentName?.trim()) {
      return res.send({ success: false, message: 'Missing President Name' });
    }

    if (!presidentEmail || !validator.isEmail(presidentEmail)) {
      return res.send({ success: false, message: 'Invalid President Email' });
    }

    if (!presidentPassword) {
      return res.send({ success: false, message: 'Missing President Password' });
    }

    const organization = await Organization.findById(resolvedOrganizationId).populate('faculty');
    if (!organization) {
      return res.send({ success: false, message: 'Organization not found' });
    }

    const isAuthority =
      (organization.organizationType === 'noFaculty' && String(organization.advisor) === String(currentUser._id)) ||
      (organization.organizationType === 'withFaculty' && String(organization.authorityRef) === String(currentUser._id));

    if (!isAuthority) {
      return res.send({ success: false, message: 'You are not the responsible authority for this organization' });
    }

    const existingPresident = await User.findOne({ email: presidentEmail.trim().toLowerCase() });
    if (existingPresident) {
      return res.send({ success: false, message: 'President email already exists' });
    }

    const hashedPassword = await bcrypt.hash(presidentPassword, 10);

    const president = new User({
      fullName: presidentName.trim(),
      email: presidentEmail.trim().toLowerCase(),
      password: hashedPassword,
      adminProfile: {
        role: 'president',
        organization: organization._id,
        faculty: organization.faculty || null,
      },
    });

    const savedPresident = await president.save();

    const project = new Project({
      projectName: projectName.trim(),
      description: description.trim(),
      organization: organization._id,
      organizationAuthorityType: organization.organizationType === 'withFaculty' ? 'dean' : 'advisor',
      organizationAuthorityRef: organization.authorityRef || organization.advisor,
      president: savedPresident._id,
    });

    const savedProject = await project.save();

    await Organization.findByIdAndUpdate(organization._id, {
      $inc: { projectCount: 1 },
    });

    return res.send({
      success: true,
      message: {
        project: savedProject,
        president: {
          id: savedPresident._id,
          fullName: savedPresident.fullName,
          email: savedPresident.email,
          role: 'president',
        },
        temporaryPassword: presidentPassword,
      },
    });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const getProjects = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.send({ success: false, message: 'Invalid user' });
    }

    const query = user.adminProfile?.role === 'welfareOfficer'
      ? {}
      : user.adminProfile?.role === 'president'
        ? { president: user._id }
        : user.adminProfile?.organization
          ? { organization: user.adminProfile.organization }
          : {};

    const projects = await Project.find(query)
      .populate('organization')
      .populate('president', 'fullName email adminProfile')
      .populate('organizationAuthorityRef', 'fullName email adminProfile');

    return res.send({ success: true, message: projects });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

const getOrganizationOptions = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.send({ success: false, message: 'Invalid user' });
    }

    const baseQuery = user.adminProfile?.role === 'welfareOfficer'
      ? {}
      : user.adminProfile?.organization
        ? { _id: user.adminProfile.organization }
        : user.adminProfile?.role === 'advisor'
          ? { advisor: user._id }
          : user.adminProfile?.role === 'dean'
            ? { authorityRef: user._id }
            : { _id: null };

    const organizations = await Organization.find(baseQuery).select('_id organizationName organizationType');

    return res.send({
      success: true,
      message: organizations,
    });
  } catch (error) {
    return res.send({ success: false, message: `Error : ${error.message}` });
  }
};

module.exports = { createProject, getProjects, getOrganizationOptions };
