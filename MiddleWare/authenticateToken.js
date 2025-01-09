const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/jwt');
const db = require('../config/db');

const authenticateToken = async (req, res, next) => {
  const token = req.header('Authorization');
  console.log(token, "token");
//   const slitetoken = token.split(' ')[1];
//   console.log(slitetoken);
  
  
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log(decoded);
    
    // const userdata = await db.query("SELECT * FROM signup WHERE id = $1", [decoded.userId]);
    // console.log(userdata.rows,")))))))))))))))");
    

    // if (!userdata.rows.length) return res.status(401).json({ error: 'User not found' });


    req.userId = decoded.userId;
    console.log(
        req.userId
    );
    // console.log(userdata.rows[0].id);
    
      
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = authenticateToken;
