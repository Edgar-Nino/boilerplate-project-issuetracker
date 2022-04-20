'use strict';

const mongoose = require('mongoose');
const Issue = require('../models/issue')

class CErrorID extends Error {
  constructor(message = '', _id = '', ...params) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CErrorID)
    }
    this.name = 'CErrorID'
    this.message = message
    this._id = _id
  }
}
class CError extends Error {
  constructor(message = '', ...params) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CError)
    }
    this.name = 'CError'
    this.message = message
  }
}


module.exports = function(app) {

  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  app.delete('/api/issues/deleteall/test', async function(req, res) {
    try {
      await Issue.deleteMany({ project_name: "test" })
      res.send("COMPLETED")
    } catch (err) {
      res.send("FAILED")
    }
  })

  app.route('/api/issues/:project')

    .get(async function(req, res) {
      try {
        let project = req.params.project;
        let { issue_title, issue_text, created_by, assigned_to, status_text, open,_id } = req.query
        const result = await Issue.find({
          project_name: project,
          ..._id ? { _id } : {},
          ...issue_title ? { issue_title } : {},
          ...issue_text ? { issue_text } : {},
          ...created_by ? { created_by } : {},
          ...assigned_to ? { assigned_to } : {},
          ...status_text ? { status_text } : {},
          ...open ? { open } : {},
        },
          '-project_name').exec()

        res.json(result)
      }
      catch (err) {

      }
    })

    .post(async function(req, res) {
      try {
        let project = req.params.project;
        let project_name = project
        let { issue_title, issue_text, created_by, assigned_to="", status_text="" } = req.body

        if (!issue_title || !issue_text || !created_by) { throw new CError('required field(s) missing') }

        let issue = new Issue({
          issue_title, issue_text, created_by, assigned_to, status_text, project_name
        })

        const newIssue = await issue.save()
        {
          let { project_name, ...issueC } = newIssue._doc
          res.json(issueC)
        }
      }
      catch (err) {
        if (err instanceof CError) {
          res.json({ error: err.message })
        } else {
          res.json({ error: 'could not create' })
        }
      }
    })

    .put(async function(req, res) {
      let { _id, issue_title="", issue_text="", created_by="", assigned_to="", status_text="", open=true } = req.body
      try {
        let project = req.params.project;

        if (!_id) { throw new CError('missing _id') }
        if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text) { throw new CErrorID('no update field(s) sent', _id) }
        const result = await Issue.updateOne({ _id: _id }, { issue_title, issue_text, created_by, assigned_to, status_text, open })

        if (!result.modifiedCount >= 1) {
          throw new Error({ message: "could not update" })
        }
        res.json({ result: "successfully updated", _id: _id })

      } catch (err) {
        if (err instanceof CErrorID) {
          res.json({ error: err.message, _id: err._id })
        } else if (err instanceof CError) {
          res.json({ error: err.message })
        } else {
          res.json({ error: 'could not update', _id: _id })
        }
      }
    })

    .delete(async function(req, res) {
      console.log("hi")
      let { _id } = req.body
      try {
        let project = req.params.project;
        if (!_id) { throw new CError('missing _id') }
        const result = await Issue.deleteOne({ _id: _id })

        if (!result.deletedCount >= 1) {
          throw new Error({ message: "could not delete" })
        }

        res.json({ result: "successfully deleted", _id: _id })
      }
      catch (err) {
        if (err instanceof CErrorID) {
          res.json({ error: err.message, _id: err._id })
        } else if (err instanceof CError) {
          res.json({ error: err.message })
        } else {
          res.json({ error: 'could not delete', _id: _id })
        }
      }
    });

};
