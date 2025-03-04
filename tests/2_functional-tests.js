const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
let testId;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  suite('POST /api/issues/{project}', function() {
    
    test('Create an issue with every field', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Test Issue',
          issue_text: 'Functional test text',
          created_by: 'Tester',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.equal(res.body.issue_title, 'Test Issue');
          // Save _id for later tests
          testId = res.body._id;
          done();
        });
    });
    
    test('Create an issue with only required fields', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Required Fields',
          issue_text: 'Only required fields provided',
          created_by: 'Tester'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.equal(res.body.issue_title, 'Required Fields');
          done();
        });
    });
    
    test('Create an issue with missing required fields', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Missing Fields'
          // issue_text and created_by missing
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
    
  });
  
  suite('GET /api/issues/{project}', function() {
    
    test('View issues on a project', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });
    
    test('View issues on a project with one filter', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({ created_by: 'Tester' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          res.body.forEach(issue => {
            assert.equal(issue.created_by, 'Tester');
          });
          done();
        });
    });
    
    test('View issues on a project with multiple filters', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({ created_by: 'Tester', issue_title: 'Test Issue' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          res.body.forEach(issue => {
            assert.equal(issue.created_by, 'Tester');
            assert.equal(issue.issue_title, 'Test Issue');
          });
          done();
        });
    });
    
  });
  
  suite('PUT /api/issues/{project}', function() {
    
    test('Update one field on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testId,
          issue_text: 'Updated text'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'result');
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testId);
          done();
        });
    });
    
    test('Update multiple fields on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testId,
          issue_title: 'Updated Title',
          issue_text: 'Updated text again'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'result');
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });
    
    test('Update an issue with missing _id', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          issue_title: 'No ID Provided'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    
    test('Update an issue with no fields to update', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });
    
    test('Update an issue with an invalid _id', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: 'invalidid123',
          issue_text: 'Trying update'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });
    
  });
  
  suite('DELETE /api/issues/{project}', function() {
    
    test('Delete an issue', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: testId })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'result');
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, testId);
          done();
        });
    });
    
    test('Delete an issue with an invalid _id', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: 'invalidid123' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });
    
    test('Delete an issue with missing _id', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({ })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    
  });
  
});
