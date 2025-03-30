const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/jwt");
const db = require("../config/db");

const authenticateToken = async (req, res, next) => {
  const token = req.header("Authorization");

  //below two line can use for the test case
  // const authHeader = req.header('Authorization');
  // const token = authHeader && authHeader.split(' ')[1];
  console.log(token, "token");

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    console.log(decoded);

    req.userId = decoded.userId;
    console.log(req.userId);

    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = authenticateToken;
