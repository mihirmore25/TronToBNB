const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    trxTransaction: {
        transactionId: String,
        from: String,
        to: String,
        senderAmount: String,
        receiverAmount: String,
    },
    bnbTransaction: {
        transactionId: String,
        from: String,
        to: String,
        senderAmount: String,
        receiverAmount: String,
    },
    firstTransaction: {
        type: Boolean,
        default: false
    },
    secondTransaction: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;