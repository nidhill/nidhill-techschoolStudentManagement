const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  sho: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  records: {
    type: [attendanceRecordSchema],
    default: []
  }
}, { timestamps: true });

attendanceSchema.index({ sho: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

 