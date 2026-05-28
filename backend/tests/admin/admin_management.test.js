const request = require('supertest');
const app = require('../../app');

const User = require('../../models/User');
const Faculty = require('../../models/Faculty');
const Venue = require('../../models/Venue');
const Organization = require('../../models/Organization');

jest.mock('../../middleware/userAuth.js', () => (req, res, next) => {
  req.body = { ...(req.body || {}), userId: 'welfare-user-id' };
  next();
});

describe('Admin Management APIs', () => {
  const welfareId = '507f191e810c19729de860aa';
  const facultyId = '507f191e810c19729de860ab';
  const advisorId = '507f191e810c19729de860ac';

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(User, 'findById').mockResolvedValue({
      _id: welfareId,
      adminProfile: { role: 'welfareOfficer' },
    });
  });

  it('creates faculty with optional dean', async () => {
    jest.spyOn(Faculty, 'findOne').mockResolvedValue(null);
    jest.spyOn(Faculty.prototype, 'save').mockImplementation(function saveMock() {
      this._id = 'faculty-1';
      return Promise.resolve(this);
    });

    const response = await request(app).post('/api/admin/faculty').send({
      facultyName: 'Faculty of Computing',
      departments: ['Software Engineering', 'Data Science'],
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message.facultyName).toBe('Faculty of Computing');
    expect(response.body.message.dean).toBeNull();
  });

  it('creates dean with faculty binding (1:1)', async () => {
    jest.spyOn(Faculty, 'findById').mockResolvedValue({
      _id: facultyId,
      dean: null,
      save: jest.fn().mockResolvedValue(true),
    });
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User.prototype, 'save').mockImplementation(function saveMock() {
      this._id = 'dean-1';
      return Promise.resolve(this);
    });

    const response = await request(app).post('/api/admin/dean').send({
      fullName: 'Prof. Test Dean',
      facultyId,
      email: 'dean1@uni.lk',
      password: 'Dean@12345',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message.adminProfile.role).toBe('dean');
    expect(response.body.message.adminProfile.faculty).toBeTruthy();
  });

  it('creates venue with ownership/authority fields', async () => {
    jest.spyOn(Venue, 'findOne').mockResolvedValue(null);
    jest.spyOn(Venue.prototype, 'save').mockImplementation(function saveMock() {
      this._id = 'venue-1';
      return Promise.resolve(this);
    });

    const response = await request(app).post('/api/admin/venue').send({
      venueName: 'Main Auditorium',
      capacity: 500,
      type: 'Auditorium',
      ownerType: 'Welfare',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message.ownerType).toBe('Welfare');
    expect(response.body.message.capacity).toBe(500);
  });

  it('creates advisor with optional organization relation', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User.prototype, 'save').mockImplementation(function saveMock() {
      this._id = 'advisor-1';
      return Promise.resolve(this);
    });

    const response = await request(app).post('/api/admin/advisor').send({
      fullName: 'Advisor One',
      email: 'advisor1@uni.lk',
      password: 'Advisor@12345',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message.adminProfile.role).toBe('advisor');
    expect(response.body.message.adminProfile.organization).toBeNull();
  });

  it('creates organization (no-faculty flow) with advisor authority', async () => {
    jest.spyOn(Organization, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'findById')
      .mockResolvedValueOnce({ _id: welfareId, adminProfile: { role: 'welfareOfficer' } })
      .mockResolvedValueOnce({ _id: advisorId, adminProfile: { role: 'advisor' }, save: jest.fn().mockResolvedValue(true) });
    jest.spyOn(Organization.prototype, 'save').mockImplementation(function saveMock() {
      this._id = 'org-1';
      return Promise.resolve(this);
    });

    const response = await request(app).post('/api/admin/organization').send({
      organizationName: 'Associate Computing Society',
      organizationType: 'noFaculty',
      advisorId,
      email: 'acs@uni.lk',
      projectCount: 2,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message.organizationType).toBe('noFaculty');
    expect(response.body.message.authorityType).toBe('advisor');
  });

  it('enforces single-instance university role', async () => {
    jest.spyOn(User, 'findOne')
      .mockResolvedValueOnce({ _id: 'existing-sports', adminProfile: { role: 'sportsDirector' } });

    const response = await request(app).post('/api/admin/university-role').send({
      fullName: 'Sports Director 2',
      email: 'sports2@uni.lk',
      password: 'Sports@12345',
      role: 'sportsDirector',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('already a user assigned as sportsDirector');
  });

});
