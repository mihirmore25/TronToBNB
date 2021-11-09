const express = require("express");
const router = express.Router();
const { getAllUsers, deleteAllUsers, createUser } = require("../controllers/users");
const { getUser, deleteUser, updateUser, resetPassword } = require("../controllers/user");

router.get("/users", getAllUsers);
router.post("/users", createUser);
router.delete("/users", deleteAllUsers);

router.get("/users/:userId", getUser);
router.post("/users/:userId/resetPassword", resetPassword);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);

module.exports = router;