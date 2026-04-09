// ============================================================
// models/Bug.js - Mongoose Bug Schema
// Unit 3: Database schema design
// ============================================================

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const activitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedAt: { type: Date, default: Date.now },
});

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Bug title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Low'],
      required: [true, 'Severity is required'],
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Fixed'],
      default: 'Open',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    tags: [{ type: String, trim: true }],
    comments: [commentSchema],
    activityLog: [activitySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bug', bugSchema);
