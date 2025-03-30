const express = require("express");
const app = express();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + file.originalname);
  },
});
const upload = multer({ storage });
module.exports = { upload };
