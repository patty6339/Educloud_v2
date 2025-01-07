const pool = require('../config/db');

class Course {
  static async findByTeacher(teacherId) {
    const result = await pool.query('SELECT * FROM courses WHERE teacher_id = $1', [teacherId]);
    return result.rows;
  }

  static async create({ title, description, teacherId }) {
    const result = await pool.query(
      'INSERT INTO courses (title, description, teacher_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description, teacherId]
    );
    return result.rows[0];
  }
}

module.exports = Course;
