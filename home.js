// const { Client } = require("pg");
// // const pg=require('pg');
// // const pg = require("pg");
// require("dotenv").config();

// const db = new Client({
//   // const db = new pg.Client({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// db.connect()
//   .then(() => console.log("Database connected"))
//   .catch((err) => console.error("Database connection error", err));
// const query='select * from signup'
// db.query(query,(err,res)=>{
//     if(!err){
//         console.log(res.rows);
//     }
//     else{
//         console.log(err.message);
        
//     }
// })
// module.exports = db;
const {Client} = require('pg')

const client = new Client({
    host: "localhost",
    port : 4000,
    user: "postgres",
    password: "root",
    database: "migration"
})

client.connect();


let query = `Select * from "a1"`;

client.query(query, (err, res)=>{
    if(!err){
        console.log(res.rows);
    } else{
        console.log(err.message)
    }
    client.end;
})