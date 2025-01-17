
// const chai=require('chai')
// const expect=chai.expect;
// const chaihttp=require('chai-http')
// const app=require('../server.js')
//  const should=chai.should();

// chai.use(chaihttp)
// chai.should();
// describe("first test collection",function(){

//   it("test  the api",(done)=>{

//     chai.request(app)
//     .post('/user/signup')
//     .end((err,res)=>{
//      expect(res).to.have.status(500)
//     })
// done();
//   })
//   // it("test two value",function(){
//   //   let expectedvalue=5;
//   //   let actualvalue=5;
//   //   expect(actualvalue).to.be.equal(expectedvalue);
//   // })
// })


const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server.js'); // Your Express app
const db = require('../config/db.js'); // Your database module
const bcrypt = require('bcryptjs');
const { expect } = chai;

chai.use(chaiHttp);
//signup testcase
describe('POST /signup', () => {
  let originalDbQuery;

  beforeEach(() => {
    originalDbQuery = db.query;
  });

  afterEach(() => {
    db.query = originalDbQuery;
  });

  it(' email already exists', async () => {
    
    db.query = (query, values) => {
      if (query.includes('SELECT * FROM signup WHERE username = $1')) {
        return Promise.resolve({
          rows: [{ email: 'test@example.com' }],
        });
      }
    };

    const response = await chai.request(app)
      .post('/signup')
      .send({
        email: 'test@gmail.com',
        password: 'password123',
      });

    expect(response.status).to.equal(400);
    expect(response.body.message).to.equal('Email already exists');
  });

  it('should successfully create a new user when email does not exist', async () => {
    
    db.query = (query, values) => {
      if (query.includes('SELECT * FROM signup WHERE username = $1')) {
        return Promise.resolve({ rows: [] }); 
      }

      if (query.includes('INSERT INTO signup')) {
        return Promise.resolve({
          rows: [{ username: 'newuser@example.com' }],
        });
      }
    };
    const response = await chai.request(app)
      .post('/signup')
      .send({
        email: 'newuser@example.com',
        password: 'password123',
      });

    expect(response.status).to.equal(400);
     expect(response.body.message).to.equal('Signup successful');
    expect(response.body.email).to.equal('newuser@example.com');
    
  });

  it(' password is missing', async () => {
    const response = await chai.request(app)
      .post('/signup')
      .send({
        email: 'no-password@example.com',
        password: '',
      });

    expect(response.status).to.equal(400);
    expect(response.body.message).to.equal('Password is required');
  });

  it(' validation error if the email is invalid', async () => {
    const response = await chai.request(app)
      .post('/signup')
      .send({
        email: 'invalid-email',
        password: 'password123',
      });

    expect(response.status).to.equal(400);
    expect(response.body.errors).to.be.an('array');
  });

  it('should handle internal server errors ', async () => {
    
    db.query = (query, values) => {
      return Promise.reject(new Error('Database connection failed'));
    };

    const response = await chai.request(app)
      .post('/signup')
      .send({
        email: 'error@example.com',
        password: 'password123',
      });

    expect(response.status).to.equal(500);
    expect(response.body.message).to.equal('Internal server error');
  });
  it('should successfully create a new user with username and password', async () => {
    
    const email = 'newuser@gmail.com';
    const password = 'password123';
  
  
    db.query = (query, values) => {
      if (query.includes('SELECT * FROM signup WHERE username = $1')) {
        return Promise.resolve({ rows: [] }); // No user found with the given email
      }
  
      if (query.includes('INSERT INTO signup')) {
        
        return Promise.resolve({
          rows: [{ username: email }] 
        });
      }
    };
  
    const response = await chai.request(app)
      .post('/signup')
      .send({ email, password });
  
    expect(response.status).to.equal(400); 
    expect(response.body.message).to.equal('Signup successful'); 
    expect(response.body.username).to.equal(email);
  });
  
  
});

// login test case
describe('POST /login', () => {
  let originalDbQuery;
  let originalBcryptCompare;

  beforeEach(() => {
    originalDbQuery = db.query;
    originalBcryptCompare = bcrypt.compare;
  });


  afterEach(() => {
    db.query = originalDbQuery;
    bcrypt.compare = originalBcryptCompare;
  });

  it('should return a token and user data for valid credentials', async () => {
  
    db.query = (query, values) => {
      if (query.includes('SELECT * FROM signup WHERE username = $1')) {
        return Promise.resolve({
          rows: [{ id: 1, username: 'test@example.com', password: '$2a$10$hashedpassword' }],
        });
      }
      return Promise.resolve({ rows: [] });
    };

   
    bcrypt.compare = (password, hashedPassword) => Promise.resolve(true);

    const response = await chai.request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal('Login successful');
    expect(response.body).to.have.property('token');
    expect(response.body.user.username).to.equal('test@example.com');
  });

  it(' user is not found', async () => {
  
    db.query = (query, values) => Promise.resolve({ rows: [] });

    const response = await chai.request(app)
      .post('/login')
      .send({
        email: 'newuser@example.com',
        password: 'password123',
      });

    expect(response.status).to.equal(400);
    expect(response.body.message).to.equal('User not found');
  });

  it(' password is invalid', async () => {
    // Mocking db.query to simulate a user found in the database
    db.query = (query, values) => {
      if (query.includes('SELECT * FROM signup WHERE username = $1')) {
        return Promise.resolve({
          rows: [{ id: 1, username: 'test@example.com', password: '$2a$10$hashedpassword' }],
        });
      }
      return Promise.resolve({ rows: [] });
    };

    bcrypt.compare = (password, hashedPassword) => Promise.resolve(false);

    const response = await chai.request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).to.equal(400);
    expect(response.body.message).to.equal('Invalid password');
  });

  it('should return validation error for missing fields', (done) => {
    chai.request(app)
      .post('/login')
      .send({
        email: '', 
        password: '', 
      })
      .end((err, response) => {
        if (err) {
          return done(err);
        }
        expect(response.status).to.equal(400);
        expect(response.body.errors).to.be.an('array');
        expect(response.body.errors).to.have.lengthOf(2); 
        done();
      });
  });
  
});


describe('GET /userdata', () => {
  let originalDbQuery;
  beforeEach(() => {
    originalDbQuery = db.query;
  });
  afterEach(() => {
    db.query = originalDbQuery;
  });
  it('should return 401 Unauthorized if no token is provided', async () => {
    
    db.query = (query, values) => {
        return Promise.reject(new Error('Database error'));  
    };

    const res = await chai.request(app)
      .get('/users')
      
    expect(res.status).to.equal(401); 
     
  });

  it('should return 500 if there is a database error', async () => {
    db.query = (query, values) => {
      return Promise.reject(new Error('Database error'));  
    };
 const validtoken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ3LCJpYXQiOjE3MzcwMjYwNTgsImV4cCI6MTczNzExMjQ1OH0.1wm8XxQuJyI-poje8WrCiztcUctej87iJ7mIY9I3TgU"
    const res = await chai.request(app)
      .get('/users')
      .set('Authorization', `Bearer ${validtoken}`); 
    expect(res.status).to.equal(403); 
  //  expect(res.body.message).to.equal('Internal server error');  
  });

});


// describe('User API', () => {
//   let originalDbQuery;

//   // Store the original db.query function to restore it after testing
//   before(() => {
//     originalDbQuery = db.query;

//     // Mock db.query function
//     db.query = (query, values) => {
//       // Simulate the SELECT query returning an existing user
//       if (query.includes('SELECT * FROM signup WHERE id = $1')) {
//         return Promise.resolve({
//           rows: [
//             {
//               id: 1,
//               username: 'oldemail@example.com',
//               password: 'hashed_old_password',
//             },
//           ],
//         });
//       }

//       // Simulate the UPDATE query for updating the user
//       if (query.includes('UPDATE signup')) {
//         return Promise.resolve({
//           rowCount: 1,  // Simulate a successful update
//           rows: [
//             {
//               id: 1,
//               username: values[0], // New email provided
//               password: values[1], // New hashed password
//             },
//           ],
//         });
//       }

//       return Promise.reject(new Error('Unexpected query'));
//     };
//   });

//   // Restore db.query after tests
//   after(() => {
//     db.query = originalDbQuery;
//   });

//   it('should successfully update user data when valid input is provided', async () => {
//     const validtoken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ3LCJpYXQiOjE3MzcwMDUxODUsImV4cCI6MTczNzA5MTU4NX0.Y7W9z71GSrzVBilhAnhIFHdcXAPv6HuqgDKa7w2JAFQ"

//     const response = await chai
//       .request(app)
//       .put('/user/47') 
//       .send({
//         email: 'newemail@example.com', 
//         password: 'newpassword123',    
//       })
//       .set('Authorization', `Bearer ${validtoken}`); 
//       ;

//     // Assertions
//     expect(response.status).to.equal(200); 
//     expect(response.body.message).to.equal('User data updated successfully');  
//     expect(response.body.updatedUser.username).to.equal('newemail@example.com'); 
//     expect(response.body.updatedUser.password).to.not.equal('newpassword123'); 
//     expect(response.body.updatedUser.password).to.include('newpassword123');
//   });

  // it('should return 404 if user does not exist', async () => {
  //   // Modify the mock to simulate no user found for id 99
  //   db.query = (query, values) => {
  //     if (query.includes('SELECT * FROM signup WHERE id = $1')) {
  //       return Promise.resolve({ rows: [] }); // No user found
  //     }
  //     return Promise.reject(new Error('Unexpected query'));
  //   };

  //   const response = await chai
  //     .request(app)
  //     .put('/update_userdata/99')  // Simulating an invalid user ID
  //     .send({
  //       email: 'newemail@example.com',
  //       password: 'newpassword123',
  //     });

  //   // Assertions for user not found case
  //   expect(response.status).to.equal(404); // User not found
  //   expect(response.body.message).to.equal('User not found');
  // });

  // it('should return 400 if validation fails (e.g., empty email)', async () => {
  //   const response = await chai
  //     .request(app)
  //     .put('/update_userdata/1') // Assuming the user ID is 1
  //     .send({
  //       email: '', // Invalid email (empty)
  //       password: 'newpassword123',
  //     });

  //   // Assertions for validation failure
  //   expect(response.status).to.equal(400);
  //   expect(response.body.errors).to.be.an('array').that.is.not.empty;
  //   expect(response.body.errors[0].msg).to.equal('Email is required');
  // });
// });