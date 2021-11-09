const User = require("../models/users");
const bcrypt = require("bcrypt");

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.json({
            User: user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const updatedUser = await User.updateOne({ _id: req.params.userId },
            {
                $set: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    emailId: req.body.emailId,
                    password: req.body.password
                }
            }
        );
        res.json({ updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.deleteOne({ _id: req.params.userId });
        res.json({ deletedUserCount: deletedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { password, password2, emailId } = req.body;

        if (!password || !password2 || (password != password2)) {
            res.status(500).json(`${password} & ${password2} doesn't match, try again!...`);
        } else {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            console.log(hash);

            await User.findOneAndUpdate({ _id: req.params.userId, emailId: emailId }, { $set: { password: hash } });
            res.status(200).json("Your new password has been updated!");
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUser,
    deleteUser,
    updateUser,
    resetPassword
};