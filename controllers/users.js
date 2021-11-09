const User = require("../models/users");
const speakeasy = require("speakeasy");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json({
            "These are  all the users": users
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const hash = await bcrypt.hash(req.body.password, saltRounds);
        const secret = await speakeasy.generateSecret();
        const newUser = User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailId: req.body.emailId,
            password: hash,
            googleauthToken: secret.base32
        });

        const user = await newUser.save();
        res.json({
            "New User created Successfully":
                user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAllUsers = async (req, res) => {
    try {
        const deletedUsersCount = await User.deleteMany({});
        res.json({ deletedUsersCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    deleteAllUsers
};