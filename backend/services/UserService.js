const UserRepository = require('../repositories/UserRepository');

class UserService {
  static async findByUsername(username) {
    return await UserRepository.findByUsername(username);
  }

  static async findByEmail(email) {
    return await UserRepository.findByEmail(email);
  }

  static async findByRole(role) {
    return await UserRepository.findByRole(role);
  }

  static async findByUsernameExcludingId(username, id) {
    return await UserRepository.findByUsernameExcludingId(username, id);
  }

  static async findByEmailExcludingId(email, id) {
    return await UserRepository.findByEmailExcludingId(email, id);
  }

  static async create(userData) {
    return await UserRepository.create(userData);
  }

  static async updateById(id, updateData) {
    return await UserRepository.updateById(id, updateData);
  }

  static async deleteById(id) {
    return await UserRepository.deleteById(id);
  }

  static async findById(id) {
    return await UserRepository.findById(id);
  }

  static async getAllUsers() {
    return await UserRepository.findAll();
  }

  static async getUserStats() {
    const users = await UserRepository.findAll();
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive !== false).length;
    const recentUsers = users.filter(user => {
      const createdDate = new Date(user.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate >= thirtyDaysAgo;
    }).length;

    return {
      totalUsers,
      activeUsers,
      recentUsers,
      totalUsersChange: '+10%',
      activeUsersChange: '-5%',
      recentUsersChange: '+20%'
    };
  }
}

module.exports = UserService;

