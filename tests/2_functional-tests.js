const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

chai.request(server).delete('/api/issues/test')

let idTest = null

suite('Functional Tests', function() {
  test('Delete all issues in test project', function(done) {
    chai
      .request(server)
      .delete('/api/issues/deleteall/test')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "COMPLETED")
        done()
      })
  })

  test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .post('/api/issues/test')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ issue_title: "My foot hurts when I dance", issue_text: "plz help I don´t have health insurance", created_by: "Quentin Tarantino", assigned_to: "everyone", status_text: "Hurts", project_name: "test" })
      .end(function(err, res) {
        const {_id, issue_title, issue_text, created_by, assigned_to, open, status_text } = res.body
        assert.equal(res.status, 200);
        assert.equal(issue_title, "My foot hurts when I dance", "issue_title")
        assert.equal(issue_text, "plz help I don´t have health insurance")
        assert.equal(created_by, "Quentin Tarantino", "created_by")
        assert.equal(assigned_to, "everyone", "assigned_to")
        assert.equal(status_text, "Hurts", "status_text")
        assert.isTrue(open, "open")
        idTest = _id
        done()
      })
  })
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .post('/api/issues/test')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ issue_title: "Help, I can't find my pc", issue_text: "My pc is lost, help me", created_by: "Porfirio Díaz", assigned_to: "", status_text: "" })
      .end(function(err, res) {
        const { issue_title, issue_text, created_by, assigned_to, open, status_text } = res.body
        assert.equal(res.status, 200);
        assert.equal(issue_title, "Help, I can't find my pc", "issue_title")
        assert.equal(issue_text, "My pc is lost, help me", "issue_text")
        assert.equal(created_by, "Porfirio Díaz", "created_by")
        assert.equal(assigned_to, "", "assigned_to")
        assert.equal(status_text, "", "status_text")
        assert.isTrue(open, "open")
        done()
      })
  })
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .post('/api/issues/test')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ assigned_to: "", status_text: "" })
      .end(function(err, res) {
        const { error } = res.body
        assert.equal(res.status, 200);
        assert.equal(error, "required field(s) missing", "Error message must contain 'required field(s) missing'")
        done()
      })
  })
  test('View issues on a project: GET request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .get('/api/issues/test')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "Response must be an array")
        assert.equal(res.body.length, 2, "Response's array length must be 2")
        done()
      })
  })
  test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .get('/api/issues/test')
      .query({created_by:'Porfirio Díaz'})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        const { issue_title, issue_text, created_by } = res.body[0]
        assert.isArray(res.body, "Response must be an array")
        assert.equal(issue_title, "Help, I can't find my pc", "issue_title")
        assert.equal(issue_text, "My pc is lost, help me", "issue_text")
        assert.equal(created_by, "Porfirio Díaz", "created_by")
        assert.equal(res.body.length, 1, "Response's array length must be 1")
        done()
      })
  })
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .get('/api/issues/test')
      .query({created_by:'Porfirio Díaz',open:true,issue_title:"Help, I can't find my pc"})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        const { issue_title, issue_text, created_by } = res.body[0]
        assert.isArray(res.body, "Response must be an array")
        assert.equal(issue_title, "Help, I can't find my pc", "issue_title")
        assert.equal(issue_text, "My pc is lost, help me", "issue_text")
        assert.equal(created_by, "Porfirio Díaz", "created_by")
        assert.equal(res.body.length, 1, "Response's array length must be 1")
        done()
      })
  })
  test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ _id:idTest, created_by: "Juan Escutia"})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        console.log(res.body)
        assert.equal(res.body.result, "successfully updated", "result must contain 'successfully updated'")
        assert.equal(res.body._id, idTest, "_id")
        done()
      })
  })
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ _id:idTest, issue_title: "Watermelon", issue_text:"Hi", open:false})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully updated", "result must contain 'successfully updated'")
        assert.equal(res.body._id, idTest, "_id")
        done()
      })
  })
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ issue_title: "Watermelon"})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id", "result must contain 'missing_id'")
        assert.isUndefined(res.body._id, "_id")
        done()
      })
  })
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ _id:idTest})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "no update field(s) sent", "result must contain 'no update field(s) sent'")
        assert.equal(res.body._id,idTest, "_id")
        done()
      })
  })
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .put('/api/issues/test')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ _id:"a",issue_title:"Help"})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not update", "result must contain 'could not update'")
        assert.equal(res.body._id,"a", "_id")
        done()
      })
  })

  test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .delete('/api/issues/test')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ _id:idTest})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully deleted", "result must contain 'successfully deleted deleted'")
        assert.equal(res.body._id,idTest, "_id")
        done()
      })
  })
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .delete('/api/issues/test')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ _id:"a"})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not delete", "result must contain 'could not delete'")
        assert.equal(res.body._id,"a", "_id")
        done()
      })
  })
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .delete('/api/issues/test')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({ })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id", "result must contain 'missing _id'")
        assert.isUndefined(res.body._id, "_id")
        done()
      })
  })
});
