const Organization = require('../models/Organization');
const Project = require('../models/Project');
const User = require('../models/User');

const createProject = async (req, res) => {
  try {
    const { organizationId, projectName, description } = req.body;

    const currentUser = await User.findById(req.body.userId);
    if (!currentUser) {
      return res.send({ success: false, message: 'Invalid user' });
    }

    if (currentUser.adminProfile?.role !== 'president') {
      return res.send({ success: false, message: 'Only a President can create a project' });
    }

    const resolvedOrganizationId = currentUser.adminProfile?.organization || organizationId;

    if (!resolvedOrganizationId) {
      return res.send({ success: false, message: 'Missing Organization' });
    }

    if (organizationId && String(organizationId) !== String(currentUser.adminProfile?.organization)) {
      return res.send({ success: false, message: 'You can only create a project for your assigned organization' });
    }

    if (!projectName?.trim()) {
      return res.send({ success: false, message: 'Missing Project Name' });
    }

    if (!description?.trim()) {
      return res.send({ success: false, message: 'Missing Description' });
    }

    const organization = await Organization.findById(resolvedOrganizationId).populate('faculty');
    if (!organization) {
      return res.send({ success: false, message: 'Organization not found' });
    }

    if (String(currentUser.adminProfile?.organization) !== String(organization._id)) {
      return res.send({ success: false, message: 'You are not assigned to this organization' });
    }

    const project = new Project({
      projectName: projectName.trim(),
      description: description.trim(),
      organization: organization._id,
      organizationAuthorityType: organization.organizationType === 'withFaculty' ? 'dean' : 'advisor',
      organizationAuthorityRef: organization.authorityRef || organization.advisor,
      president: currentUser._id,
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
          id: currentUser._id,
          fullName: currentUser.fullName,
          email: currentUser.email,
          role: 'president',
        },
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
