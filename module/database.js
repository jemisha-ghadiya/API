// const { Client } = require('pg');

// // Define PostgreSQL client connection
// const db = new Client({
//   user: "postgres",
//   host: "localhost",
//   database: "task",  // Replace with your database name
//   password: "root",  // Replace with your password
//   port: 4000,        // PostgreSQL default port is 5432
// });

// // Connect to the database
// const connect = async () => {
//   try {
//     await db.connect();  // Connect using pg client
//      console.log('Database connected successfully!!!!!');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// };

// // Export the db client and connect function


// module.exports= {db};