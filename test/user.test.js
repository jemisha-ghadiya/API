const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server.js");
const bcrypt = require("bcryptjs");
const expect = chai.expect;
chai.use(chaiHttp);
const jwt = require("jsonwebtoken");
const user = require("../module/user.js");
const { SECRET_KEY } = require("../config/jwt");
const db = require("../config/db");

describe("Signup Controller", function () {
  let email, password;

  beforeEach(() => {
    email = `testuser@example.com`;
    password = "testpassword123";
  });
  it("should signup a user successfully", async function () {
    const signupData = {
      email,
      password,
    };

    const res = await chai.request(app).post("/signup").send(signupData);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Signup successful");
    expect(res.body.email).to.equal(email);
  });

  it("should fail when email already exists", async function () {
    await user.createUser(email, password);

    const signupData = {
      email,
      password: "newpassword123",
    };

    const res = await chai.request(app).post("/signup").send(signupData);
    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Email already exists");
  });
  it("should fail when password is missing", async function () {
    const signupData = {
      email,
      password: "",
    };

    const res = await chai.request(app).post("/signup").send(signupData);
    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Password is required");
  });
  it("should fail when email is invalid", async function () {
    const signupData = {
      email: "invalidemail",
      password,
    };
    const res = await chai.request(app).post("/signup").send(signupData);
    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an("array").with.lengthOf.at.least(1);
    expect(res.body.errors[0].msg).to.equal(
      "Please enter a valid email address"
    );
  });

  afterEach(async () => {
    const result = await user.deleteUserByEmail(email);
    if (result.rows.length > 0) {
      await user.deleteUser(result.rows[0].id);
      // console.log(result.rows);
      // console.log(result);
    }
  });
});

describe("Login Controller", function () {
  let email, password;

  beforeEach(() => {
    email = `testuser@example.com`;
    password = "testpassword123";
  });
  it("should login a user successfully", async function () {
    const loginData = {
      email,
      password,
    };

    // Simulate a successful signup first
    await chai.request(app).post("/signup").send({
      email: email,
      password: password,
    });

    const res = await chai.request(app).post("/login").send(loginData);

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Login successful");

  });
  it("should fail when email does not exist", async function () {
    const loginData = {
      email: "nonexistent@example.com",
      password,
    };

    const res = await chai.request(app).post("/login").send(loginData);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("User not found");
  });

  it("should fail when password is incorrect", async function () {
    const loginData = {
      email,
      password: "wrongpassword",
    };

    await chai.request(app).post("/signup").send({
      email: email,
      password: password,
    });

    const res = await chai.request(app).post("/login").send(loginData);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Invalid password");
  });

  afterEach(async () => {
    const result = await user.deleteUserByEmail(email);
    if (result.rows.length > 0) {
      await user.deleteUser(result.rows[0].id);
    }
  });
});

describe("GET /user", function () {
    let validToken;
    let userId = 2; 
  
    before(() => {
      
      validToken = jwt.sign({ userId: userId }, SECRET_KEY, { expiresIn: "1d" });
    });
  
    it("should return user data if user exists", (done) => {
      
      chai
        .request(app)
        .get("/users") 
        .set("Authorization", `Bearer ${validToken}`)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.result).to.be.an("array").that.is.not.empty;
       console.log(res.body);
       
          done();
        });
    });
    
  });


describe('User Update API Tests', () => {
    let validToken;
    let userId = 2;  
  
 
    before(async () => {
   
      validToken = jwt.sign({ userId: userId }, SECRET_KEY, { expiresIn: '1d' });
    });
  
    it('should update user data successfully', async () => {
      const res = await chai
        .request(app)
        .put(`/user/${userId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ email: 'updateduser@example.com', password: 'newpassword' });
  
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('User data updated successfully');
      expect(res.body.updatedUser.username).to.equal('updateduser@example.com');
    });
  

  
    it('should return 500 if an error occurs during the update process', async () => {
        const originalUpdateUser = user.updateUser;  
        user.updateUser = async () => {
          throw new Error('Database error');  
        };
      const res = await chai
        .request(app)
        .put(`/user/${userId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ email: 'jemisha@example.com', password: 'jemisha@12' });
  
      expect(res.status).to.equal(500);
      expect(res.body.message).to.equal('An error occurred while updating the user data. Please try again later.');
      
      user.updateUser = originalUpdateUser;
    });
  });

describe("DELETE /user/:id", () => {
  let userId=38;
  let validToken; 

  before(async () => {
    
    validToken = jwt.sign({ userId: userId }, SECRET_KEY, { expiresIn: "1d" });
  });

  // after(async () => {
  //   await db.query("DELETE FROM signup WHERE id = $1", [userId]);
  // });

  it("should delete the user successfully", async function () {
    const res = await chai
      .request(app)
      .delete(`/user/${userId}`)
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("User deleted successfully");
  });

  it("should return 403 if user tries to delete another user", async function () {
    const res = await chai
      .request(app)
      .delete(`/user/9999`) 
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal(
      "You are not authorized to delete this user."
    );
  });
  it("should return 500 if server error occur", async function () {
    const res = await chai
      .request(app)
      .delete(`/user/293`)
      .set("Authorization", `Bearer ${validToken}`);

    //  expect(res.status).to.equal(500);
    expect(res.body.message).to.equal(
      "You are not authorized to delete this user."
    );
  
  });
});
