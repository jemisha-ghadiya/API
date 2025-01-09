const {
  signup,
  login,
  get_userdata,
  update_userdata,
  delete_userdata,
} = require("../controllers/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/jwt");
const db = require("../config/db");
const { validationResult, body } = require("express-validator");
const { json } = require("body-parser");
const {describe, expect, test} =require('@jest/globals') ;
 jest.mock("../config/db");
jest.mock("bcryptjs", () => ({
  AES: {
    encrypt: jest.fn().mockReturnValue("encrypt-password"),
  },
}));
jest.mock("../controllers/user.js", () =>    ({
  signup: jest.fn(),
  login:jest.fn(),
}));


//signup test case
// describe("signup", () => {
//   test("signup to the user", async () => {
//     const req = {
//       body: {
//         email: "jemisha04@gmail.com",
//         password: "jemisha12",
//       },
//     };
//     const saveMock = jest.fn().mockResolvedValue({
//       _id: "user_id",
//       email: req.body.email,
//       // password:req.body.password
//     });
//     signup.mockReturnValue({ save: saveMock });
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//     await signup(req, res);
//     expect(signup).toHaveBeenCalledTimes(1);
//   // expect(signup).toHaveBeenCalledWith([{
//   //     email: req.body.email,
//   //     password: "encrypt-password",
//   //   }]);
//     // expect(res.status).toHaveBeenCalledWith(201)
//     // expect(res.json).toHaveBeenLastCalledWith ({ _id: "user_id", email: req.body.email }); 
//   });
// });
// test('error can defind is 500',async()=>{
//   const req = {
//     body: {
//       email: "jemisha04@gmail.com",
//       password: "jemisha12",
//     },
//   };
//   signup.mockReturnValue({save:jest.fn().mockRejectedValue(new Error('error'))});
//   const res={
//     status:jest.fn().mockReturnThis(),
//     json:jest.fn()
//   }
//   await signup(req,res);
//   expect(res.status).toHaveBeenCalledWith(500)
// })

//login test case
describe("login", () => {
    test("login to the user", async () => {
      const req = {
        body: {
          email: "jemisha04@gmail.com",
          password: "jemisha12",
        },
      };
      const saveMock = jest.fn().mockResolvedValue({
        _id: "user_id",
        email: req.body.email,
        // password:req.body.password
      });
      login.mockReturnValue({ save: saveMock });
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      await login(req, res);
      expect(login).toHaveBeenCalledTimes(1);
      expect(login).toHaveBeenCalledWith(req,res)
    // expect(login).toHaveBeenCalledWith([{
    //     email: req.body.email,
    //     password: "encrypt-password",
    //   }]);
      // expect(login).toHaveBeenCalledWith(201)
      // expect(res.json).toHaveBeenLastCalledWith ({ _id: "user_id", email: req.body.email }); 
    });
  });
  test('error can defind is 500',async()=>{
    const req = {
      body: {
        email: "jemisha04@gmail.com",
        password: "jemisha12",
      },
    };
    login.mockReturnValue({save:jest.fn().mockRejectedValue(new Error('error'))});
    const res={
      status:jest.fn().mockReturnThis(),
      json:jest.fn(),
      body:{
       email: "jemisha04@gmail.com",
        password: "jemisha12",
      }
    }
    await signup(req,res);
    expect(res.status).toHaveBeenCalledWith(500)
    // expect(login).toHaveBeenCalledWith(req,res)
  })
