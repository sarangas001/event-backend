const bcrypt = require('bcryptjs');

const User = require('../models/User');

const defaultRoles = [
  { fullName: 'Welfare Officer', email: 'welfare@uni.lk', role: 'welfareOfficer' },
  { fullName: 'Sports Director', email: 'sports.director@uni.lk', role: 'sportsDirector' },
  { fullName: 'Chairman of Art', email: 'chairman.art@uni.lk', role: 'chairmanOfArt' },
  { fullName: 'Proctor', email: 'proctor@uni.lk', role: 'proctor' },
  { fullName: 'Vice Chancellor', email: 'vice.chancellor@uni.lk', role: 'viceChancellor' },
];

const seedDefaults = async () => {
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@12345';
  const hashedPassword = await bcrypt.hash(password, 10);

  for (const item of defaultRoles) {
    const existing = await User.findOne({ 'adminProfile.role': item.role });
    if (existing) continue;

    await User.create({
      fullName: item.fullName,
      email: item.email,
      password: hashedPassword,
      isAccountVerified: true,
      adminProfile: { role: item.role },
    });
  }
};

module.exports = seedDefaults;
