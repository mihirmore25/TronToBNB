require("dotenv").config;
const express = require("express");
const router = express.Router();
const { userLogin } = require("../controllers/userLogin");

router.post("/:userId/login", userLogin);

module.exports = router;