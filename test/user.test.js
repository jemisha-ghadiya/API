const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server.js");
const bcrypt = require("bcryptjs");
const expect = chai.expect;
chai.use(chaiHttp);

const user = require("../module/user.js");

describe('Signup Controller', function () {
  let email, password;

  beforeEach(() => {
    email = `testuser@example.com`; 
    password = 'testpassword123'; 
  });
  it('should signup a user successfully', async function () {
    const signupData = {
      email,
      password
    };

    const res = await chai.request(app)
      .post('/signup') 
      .send(signupData);

    
    expect(res.status).to.equal(400) 
    expect(res.body.message).to.equal('Signup successful');
    expect(res.body.email).to.equal(email); 
  });

  it('should fail when email already exists', async function () {
  
    await user.createUser(email, password);

    const signupData = {
      email,
      password: 'newpassword123'
    };

    const res = await chai.request(app)
      .post('/signup')
      .send(signupData);
    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal('Email already exists');
  });
  it('should fail when password is missing', async function () {
    const signupData = {
      email,
      password: ''
    };

    const res = await chai.request(app)
      .post('/signup')
      .send(signupData);
    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal('Password is required');
  });
  it('should fail when email is invalid', async function () {
    const signupData = {
      email: 'invalidemail',
      password
    };
    const res = await chai.request(app)
      .post('/signup')
      .send(signupData);
    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an('array').with.lengthOf.at.least(1);
    expect(res.body.errors[0].msg).to.equal('Please enter a valid email address');
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


// describe('Login Controller', function () {
//   let createdUser;
//   const password = 'testpassword123';
//   beforeEach(async () => {
//     const email = `testuser@example.com`; 
//     createdUser = await user.createUser(email, await bcrypt.hash(password, 10)); 
//     createdUser.password = password; 
//   });

  
//   it('should login a user successfully with valid credentials', async function () {
//     const loginData = {
//       email: createdUser.email,
//       password: password
//     };

//     const res = await chai.request(app)
//       .post('/login') 
//       .send(loginData);

    
//     expect(res.status).to.equal(200); 
//     expect(res.body.message).to.equal('Login successful');
//     expect(res.body.token).to.be.a('string'); 
//     expect(res.body.user.email).to.equal(createdUser.email); 
//   });

  
//   it('should fail when email is not found', async function () {
//     const loginData = {
//       email: 'nonexistentuser@example.com',
//       password: 'wrongpassword'
//     };

//     const res = await chai.request(app)
//       .post('/login')
//       .send(loginData);

//     expect(res.status).to.equal(400);
//     expect(res.body.message).to.equal('User not found');
//   });

  
//   it('should fail when password is incorrect', async function () {
//     const loginData = {
//       email: createdUser.email,
//       password: 'wrongpassword' 
//     };

//     const res = await chai.request(app)
//       .post('/login')
//       .send(loginData);

 
//     expect(res.status).to.equal(400);
//     expect(res.body.message).to.equal('Invalid password');
//   });

  
//   afterEach(async () => {
//     const result = await user.deleteUserByEmail(createdUser.email);
//     if (result.rows.length > 0) {
//       await user.deleteUser(result.rows[0].id); 
//     }
//   });
// });