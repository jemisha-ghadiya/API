const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server.js");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/jwt");
const todotask = require("../module/task");
const { create_todo } = require("../controllers/task"); //
const expect = chai.expect;
chai.use(chaiHttp);
const generateToken = (userId) => {
    return jwt.sign({ userId: userId }, SECRET_KEY, { expiresIn: "1h" });
  };
describe("POST /todos", () => {
    const userId = 2;
    const validToken = generateToken(userId);

  it("should create a new todo task successfully", async function () {
    

    const res = await chai
      .request(app)
      .post("/todopage")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        task: "Test Task",
        description: "Test description",
        duration: "2 hours",
        email: "test@example.com",
      });
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Data inserted successfully");
  });

  it("should return 400 if required fields are missing", async function () {
   

    const res = await chai
      .request(app)
      .post("/todopage")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        task: "Test Task",
      });

    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal(
      "All fields are required (task, description, duration)."
    );
  });

  it("should return 403 if invalid token is provided", async function () {
    const res = await chai
      .request(app)
      .post("/todopage")
      .set("Authorization", "Bearer invalid_token")
      .send({
        task: "Test Task",
        description: "Test description",
        duration: "2 hours",
        email: "test@example.com",
      });
    expect(res.status).to.equal(403);
    expect(res.body.error).to.equal("Invalid token");
  });

  it("should return 500 if there is an internal server error", async function () {
    
    const originalCreateTodo = todotask.createtododata;
    todotask.createtododata = async () => {
      throw new Error("Simulated database error");
    };
  
    const res = await chai
      .request(app)
      .post("/todopage")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        task: "Test Task",
        description: "Test description",
        duration: "2 hours",
        email: "test@example.com",
      })
        expect(res.status).to.equal(500);
        expect(res.body.error).to.equal("Failed to add task");
        todotask.createtododata = originalCreateTodo;

  });
  after(async () => {
    const userId = 2;
    await db.query("DELETE FROM todolist WHERE signup_id = $1", [userId]);
  });
});

describe('GET /todopage', () => {
    let validToken;
    const userId = 5;
    before(() => {
      validToken = generateToken(userId); 
    });
  
    it('should return 200 and task data if tasks are found', (done) => {
  
      chai.request(app)
        .get('/todopages')
        .set('Authorization', `Bearer ${validToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
        //   expect(res.body.todoAllData).to.be.an("array").that.is.not.empty;
          done();
        });
    });

  
    it('should return 500 if an error occurs when retrieving tasks', (done) => {
      const originalGetTodos = todotask.gettododataById;
      todotask.gettododataById = async () => {
        message="server error"
      };
  
      chai.request(app)
        .get('/todopages')
        .set('Authorization', `Bearer ${validToken}`)
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body.error).to.equal("Failed to add task");
  
          
          todotask.gettododataById = originalGetTodos;
          done();
        });
    });
  });

describe('PUT /todopage/:id', () => {
    let validToken;
    const userId = 5;
    const taskId=2;
    before(async () => {
      validToken = generateToken(userId);
    });
  
  
    it('should return 200 and updated task if task is updated successfully', () => {
      const updatedTaskData = {
        task: "Updated Task",
        description: "Updated Description",
        duration: "30 minutes",
        email: "updated_email@example.com",
        
      };
  
      chai.request(app)
        .put(`/todopage/${taskId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send(updatedTaskData)
        .end(async (err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal("Task updated successfully");
          expect(res.body.task.task).to.equal(updatedTaskData.task);
          expect(res.body.task.description).to.equal(updatedTaskData.description);
        });
    });
  
   
    it('should return 404 if task not found or user has no permission to update', (done) => {
      const updatedTaskData = {
        task: "Updated Task",
        description: "Updated Description",
        duration: "30 minutes",
        email: "updated_email@example.com",
      };
  
      chai.request(app)
        .put(`/todopage/9999`) 
        .set('Authorization', `Bearer ${validToken}`)
        .send(updatedTaskData)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body.message).to.equal("Task not found or you do not have permission to update this task");
          done();
        });
    });
  
 
    it('should return 500 if an error occurs while updating the task', (done) => {
      const updatedTaskData = {
        task: "Updated Task",
        description: "Updated Description",
        duration: "30 minutes",
        email: "updated_email@example.com",
      };
  
      const originalUpdateTask = todotask.updatetododata;
      todotask.updatetododata = async () => {
        throw new Error("Database error");
      };
  
      chai.request(app)
        .put(`/todopage/${taskId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send(updatedTaskData)
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body.message).to.equal("An error occurred while updating the task. Please try again later.");

          todotask.updatetododata = originalUpdateTask;
          done();
        });
    });
  });

describe('DELETE /todopage/:id', () => {
    let validToken;
    const userId = 15;
    const taskId = 1;

    before(async () => {
      validToken = generateToken(userId);
  
      
      const result = await db.query(`
        INSERT INTO todolist (task, description, duration, username, signup_id)
        VALUES ('Test Task', 'Test Description', '30 minutes', 'testuser@example.com', ${userId})
        RETURNING id
      `);
    //   taskId = result.rows[0].id; 
    });
  
    it('should return 200 and confirm task deletion if task is deleted successfully', () => {
      chai.request(app)
        .delete(`/todopage/${taskId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .end(async (err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal("Task deleted successfully");
  
          const deletedTask = await db.query(`
            SELECT * FROM todolist WHERE id = $1 AND signup_id = $2
          `, [taskId, userId]);
          expect(deletedTask.rows.length).to.equal(0); 
  
        });
    });
  
    
    it('should return 404 if task not found or user has no permission to delete', (done) => {
      chai.request(app)
        .delete(`/todopage/9999`) 
        .set('Authorization', `Bearer ${validToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body.message).to.equal("Task not found or you do not have permission to delete this task");
          done();
        });
    });
  
   
    it('should return 500 if an error occurs while deleting the task', () => {
        const taskId = 1;
  const validToken = generateToken(userId); 


  const originalGetDataById = todotask.getdataById;
  todotask.getdataById = async () => ({ rows: [{ id: taskId }] });
    
      const originalDeleteTask = todotask.deletetododata;
      todotask.deletetododata = async () => {
        throw new Error("Database error");
      };
  
      chai.request(app)
        .delete(`/todopage/${taskId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body.error).to.equal("Failed to delete task");
          todotask.getdataById = originalGetDataById;
          todotask.deletetododata = originalDeleteTask;
        
        });
    });
    after(async () => {
      await db.query(`DELETE FROM todolist WHERE signup_id = $1`, [userId]);
    });
  });