require("dotenv").config;
const User = require("../models/users");
const speakeasy = require("speakeasy");
const Jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userLogin = async (req, res) => {
    try {
        const { body } = req;
        const { emailId } = body;
        const { password } = body;
        const { token } = body;

        const user = await User.findById(req.params.userId);
        // console.log(user);

        if (emailId === user.emailId) {
            const match = await bcrypt.compare(password, user.password);
            if (match === true) {
                const base32secret = user.googleauthToken;

                const validate = speakeasy.totp.verify({
                    secret: base32secret,
                    encoding: 'base32',
                    token: token
                });

                if (validate) {
                    Jwt.sign({ user }, process.env.JWT_PRIVATE_KEY, { expiresIn: "15m" }, (err, token) => {
                        if (err) {
                            console.log(err);
                        }
                        res.json({
                            verified: true,
                            token
                        });
                    });
                } else {
                    res.json({ verified: false });
                }
            }
        } else {
            res.status(403).json({ "Error": "Could Not Log In!.." });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    userLogin
};
