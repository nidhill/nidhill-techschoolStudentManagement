const User = require('../models/User');

class UserRepository {
  static async findByUsername(username) {
    return await User.findOne({ username });
  }

  static async findByEmail(email) {
    return await User.findOne({ email });
  }

  static async findByRole(role) {
    return await User.find({ role }).select('-password');
  }

  static async findByUsernameExcludingId(username, id) {
    return await User.findOne({ username, _id: { $ne: id } });
  }

  static async findByEmailExcludingId(email, id) {
    return await User.findOne({ email, _id: { $ne: id } });
  }

  static async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  static async updateById(id, updateData) {
    return await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
  }

  static async deleteById(id) {
    return await User.findByIdAndDelete(id);
  }

  static async findById(id) {
    return await User.findById(id).select('-password');
  }

  static async findAll() {
    return await User.find({}).select('-password');
  }

  static async findByIdWithPassword(id) {
    return await User.findById(id);
  }

  static async updatePassword(id, hashedPassword) {
    return await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );
  }

  static async findByRoleWithPassword(role) {
    return await User.find({ role });
  }
}

module.exports = UserRepository;

