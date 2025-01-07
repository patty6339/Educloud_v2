const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

// Check if the model is already defined
const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

class User {
  static async findByEmail(email) {
    return await UserModel.findOne({ email });
  }

  static async create({ email, password, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await UserModel.create({ email, password: hashedPassword, role });
  }

  async verifyPassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

module.exports = User;
