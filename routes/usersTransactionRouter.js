require("dotenv").config;
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { getAllTransactions, getTransaction, getBalanceOfEth, getBalanceOfBnb, sendTransaction, createTransaction } = require("../controllers/userTransaction");

router.get("/:userId/transactions", verifyToken, getAllTransactions);
router.post("/:userId/transactions", verifyToken, createTransaction);
router.get("/:userId/getTransaction", verifyToken, getTransaction);
router.post("/:userId/sendTransaction", verifyToken, sendTransaction);
router.get("/:userId/getBalanceOfEth", verifyToken, getBalanceOfEth);
router.get("/:userId/getBalanceOfBnb", verifyToken, getBalanceOfBnb);

module.exports = router;