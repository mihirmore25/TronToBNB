const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userAccountSchema = new Schema({
    createdAddress: String,
    privateKey: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

const Account = mongoose.model("Account", userAccountSchema);

module.exports = Account;