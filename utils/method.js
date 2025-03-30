

module.exports = {
    async hashPassword(password) {
      const bcrypt = require("bcryptjs");
      return await bcrypt.hash(password, 10);
    },
    async comparePassword(plainPassword, hashedPassword) {
      const bcrypt = require("bcryptjs");
      return await bcrypt.compare(plainPassword, hashedPassword);
    },
    generateToken(userId, secretKey, expiration = "1d") {
      const jwt = require("jsonwebtoken");
      return jwt.sign({ userId }, secretKey, { expiresIn: expiration });
    },
  };
  