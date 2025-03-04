'use strict';

const Issue = require('../models/Issue');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res) {
      const project = req.params.project;
      // Create filter object from query parameters and enforce the project parameter
      const filter = { ...req.query, project };
      try {
        const issues = await Issue.find(filter);
        return res.json(issues);
      } catch (err) {
        return res.json({ error: 'could not retrieve issues' });
      }
    })
    
    .post(async function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      
      const newIssue = new Issue({
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      });
      
      try {
        const savedIssue = await newIssue.save();
        return res.json(savedIssue);
      } catch (err) {
        return res.json({ error: 'could not save issue' });
      }
    })
    
    .put(async function (req, res) {
      const project = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      
      // Build an object containing only the fields that were provided
      let updateFields = {};
      if (issue_title) updateFields.issue_title = issue_title;
      if (issue_text) updateFields.issue_text = issue_text;
      if (created_by) updateFields.created_by = created_by;
      if (assigned_to) updateFields.assigned_to = assigned_to;
      if (status_text) updateFields.status_text = status_text;
      if (open !== undefined) updateFields.open = open;
      
      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }
      
      updateFields.updated_on = new Date();
      
      try {
        const updatedIssue = await Issue.findByIdAndUpdate(_id, updateFields, { new: true });
        if (!updatedIssue) {
          return res.json({ error: 'could not update', _id });
        }
        return res.json({ result: 'successfully updated', _id });
      } catch (err) {
        return res.json({ error: 'could not update', _id });
      }
    })
    
    .delete(async function (req, res) {
      const project = req.params.project;
      const { _id } = req.body;
      
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      
      try {
        const deletedIssue = await Issue.findByIdAndDelete(_id);
        if (!deletedIssue) {
          return res.json({ error: 'could not delete', _id });
        }
        return res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        return res.json({ error: 'could not delete', _id });
      }
    });
    
};
