require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { getAccounts, createTrxAccount } = require("../controllers/userAccount");

router.get("/:userId/accounts", verifyToken, getAccounts);
router.post("/:userId/createTrxAccount", verifyToken, createTrxAccount);

module.exports = router;