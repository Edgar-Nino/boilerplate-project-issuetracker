const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const issueSchema = new Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String },
  open: { type: Boolean, default: true },
  status_text: { type: String },
  project_name: { type: String, required: true },
},
  {
    timestamps: { createdAt: 'created_on', updatedAt: 'updated_on' },
    versionKey: false
  }
)

const Issue = model('Issue', issueSchema)

module.exports = Issue