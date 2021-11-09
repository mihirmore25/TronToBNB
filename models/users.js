const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    emailId: String,
    password: String,
    googleauthToken: String,
    transactions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction"
        }
    ],
    accounts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account"
        }
    ]
});

const User = mongoose.model("User", userSchema);

module.exports = User;