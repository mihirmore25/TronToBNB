require("dotenv").config;
const nodemailer = require("nodemailer");
const Jwt = require("jsonwebtoken");
const User = require("../models/users");
const Account = require("../models/accounts");
const Transaction = require("../models/transactions");
const Trx = require("ethereumjs-tx").Transaction;
const { fromHex } = require("tron-format-address");

// Tron trx
const TronWeb = require("tronweb");
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.shasta.trongrid.io/");
const solidityNode = new HttpProvider("https://api.shasta.trongrid.io/");
const eventServer = new HttpProvider("https://api.shasta.trongrid.io/");
const privateKey = process.env.TRON_PRIVATE_KEY;
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

// TO_TRON_PRIVATE_KEY = b332ffc7405a746e123c3b78076086ecbc2b38271ed154e3538a5a84a8bc0ecc
// FROM_NEW_TRON_PRIVATE_KEY = 01121C110A1F7173713ED2CBDCBF5FFD0B2DAB8294A4F162F88809CEEABFEF83
// const fromAddress = "TDBcbqXb7ubiLo2yf9BvVB9iw6J64PrTfN";
const toAddress = "TQA79oUcQ2wtYHRTho9Q1oqBf5vLBvpXfS";
let amount = 10000;

// const privateKey = process.env.FROM_NEW_TRON_PRIVATE_KEY;


// Bnb
const Web3 = require("web3");
const web3bsc = new Web3(
    new Web3.providers.HttpProvider(
        "https://bsc-testnet.web3api.com/v1/6GMM7M97XKA1GKX8VA62W1QQVKED6FIHSS"
    )
);
const BnbTransaction = require("ethereumjs-tx").Transaction;
const common = require("ethereumjs-common");

const bnbAccount1 = "0x8a13cd53130d3A44162b91281F723096fece408c";
const bnbAccount2 = "0x91F1994e516037C6Aa2213586503fede4D5eb7ff";
const bnbPrivateKey = Buffer.from(process.env.BNB_PRIVATE_KEY, "hex");



const getAllTransactions = (req, res) => {
    Jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        (async () => {
            try {
                const userTransactions = await User.findById(req.params.userId).populate("transactions");
                res.json({ userTransactions });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        })();
    });
};

const createTransaction = (req, res) => {
    Jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        (async () => {

            const user = await User.findById(req.params.userId);

            const newTransaction = new Transaction({
                transactionId: req.body.transactionId,
                from: req.body.from,
                to: req.body.to,
                senderAmount: web3.utils.toWei(req.body.senderAmount, "ether"),
                receiverAmount: web3.utils.toWei(req.body.receiverAmount, "ether"),
                user: user._id
            });

            const transaction = await newTransaction.save();

            user.transactions.push(transaction._id);
            await user.save();
            res.json({ user });
        })();
    });
};


const getTransaction = (req, res) => {
    Jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        (async () => {
            try {
                // const user = await User.findById(req.params.userId);

                const transaction = await Transaction.findOne({ user: req.params.userId });

                const usersTransactionDetails = await tronWeb.eth.getTransaction(transaction.transactionId);

                res.json({ usersTransactionDetails });

            } catch (error) {
                res.status(500).json({ message: error.message });
            }

        })();

    });
};

const sendTransaction = (req, res) => {
    Jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        (async () => {
            try {
                const userAccount = await Account.findOne({ user: req.params.userId });
                console.log(userAccount);

                const tradeobj = await tronWeb.transactionBuilder.sendTrx(
                    toAddress,
                    amount,
                    userAccount.createdAddress
                );
                const signedtxn = await tronWeb.trx.sign(
                    tradeobj,
                    userAccount.privateKey
                );
                const receipt = await tronWeb.trx.sendRawTransaction(
                    signedtxn
                );

                console.log(receipt);

                const user = await User.findById(req.params.userId);

                const transactionOfTron = await tronWeb.trx.getTransaction(receipt.txid);
                console.log(transactionOfTron);

                const newTransaction = new Transaction({
                    user: user._id
                });

                const userTransaction = await newTransaction.save();

                user.transactions.push(userTransaction._id);
                await user.save();

                console.log(user);

                const recentTronTransactionDetailsOfUser = transactionOfTron.raw_data.contract.pop();
                console.log(recentTronTransactionDetailsOfUser);

                userTransaction.trxTransaction.transactionId = transactionOfTron.txID;
                userTransaction.trxTransaction.from = fromHex(recentTronTransactionDetailsOfUser.parameter.value.owner_address);
                userTransaction.trxTransaction.to = fromHex(recentTronTransactionDetailsOfUser.parameter.value.to_address);
                userTransaction.trxTransaction.senderAmount = tronWeb.fromSun(recentTronTransactionDetailsOfUser.parameter.value.amount);
                userTransaction.trxTransaction.receiverAmount = tronWeb.fromSun(recentTronTransactionDetailsOfUser.parameter.value.amount);
                userTransaction.firstTransaction = true;
                userTransaction.user = user._id;

                await userTransaction.save();

                const dollars = trxToDollar(recentTronTransactionDetailsOfUser.parameter.value.amount);
                console.log(dollars);

                const bnb = dollarToBnb(dollars);
                console.log(bnb);

                const bscTransactionCount = await web3bsc.eth.getTransactionCount(bnbAccount1);

                const trxObject = {
                    from: bnbAccount1,
                    nonce: web3bsc.utils.toHex(bscTransactionCount),
                    to: bnbAccount2,
                    value: web3bsc.utils.toHex(web3bsc.utils.toWei(bnb.toString(), 'ether')),
                    gasLimit: web3bsc.utils.toHex(21000),
                    gasPrice: web3bsc.utils.toHex(web3bsc.utils.toWei('20', 'gwei'))
                }

                const chain = common.default.forCustomChain(
                    'mainnet', {
                    name: 'bnb',
                    networkId: 97,
                    chainId: 97
                },
                    'petersburg'
                );

                const bnbTrx = new Trx(trxObject, { common: chain });
                bnbTrx.sign(bnbPrivateKey);

                const serializedTransaction = bnbTrx.serialize();
                console.log(serializedTransaction);

                const raw = '0x' + serializedTransaction.toString('hex');
                console.log(raw);

                const bnbTransactionHash = await web3bsc.eth.sendSignedTransaction(raw);

                const transactionOfBnb = await web3bsc.eth.getTransaction(bnbTransactionHash.transactionHash);
                console.log(transactionOfBnb);

                userTransaction.bnbTransaction.transactionId = transactionOfBnb.hash;
                userTransaction.bnbTransaction.from = transactionOfBnb.from;
                userTransaction.bnbTransaction.to = transactionOfBnb.to;
                userTransaction.bnbTransaction.senderAmount = web3bsc.utils.fromWei(transactionOfBnb.value, "ether");
                userTransaction.bnbTransaction.receiverAmount = web3bsc.utils.fromWei(transactionOfBnb.value, "ether");
                userTransaction.secondTransaction = true;
                userTransaction.user = user._id;

                const allNewTransaction = await userTransaction.save();

                res.json({ allNewTransaction });

            } catch (error) {
                console.log(error);
                res.status(500).json({ message: error.message });
            }
        })();
    });
};


const getBalanceOfEth = (req, res) => {
    Jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        (async () => {
            try {
                const account = await Account.findOne({ user: req.params.userId });
                const userAccountBalance = await web3.eth.getBalance(account.createdAddress);
                const userAccountBalanceInEthers = await web3.utils.fromWei(String(userAccountBalance), "ether");
                res.json({ userAccountBalanceInEthers });

            } catch (error) {
                res.status(500).json({ message: error.message });
            }

        })();
    });
};

const getBalanceOfBnb = (req, res) => {
    Jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        (async () => {
            try {
                const transactions = await Transaction.find({ user: req.params.userId });
                // console.log(transactions);
                // console.log(transactions.pop());
                const userTransaction = transactions.pop();
                const userAccountBalanceOfRecentTransaction = await web3bsc.eth.getBalance(userTransaction.bnbTransaction.to);
                const userAccountBalanceOfRecentTransactionInBnb = await web3bsc.utils.fromWei(userAccountBalanceOfRecentTransaction, "ether");
                res.json({ userAccountBalanceOfRecentTransactionInBnb });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        })();
    });
};


let dollarValueOfOneTrx = 0.11; // 1 trx is equal to the 0.11 usd
let bnbValueOfOneDollar = 0.0016; // 1 usd is equal to the 0.0016 bnb

// const etherToWei = web3.utils.toWei("1", "ether");
// console.log(etherToWei);

function trxToDollar(number) {
    const trx = tronWeb.fromSun(String(number));
    // console.log(trx);
    const trxDollar = trx * dollarValueOfOneTrx;
    return trxDollar;
};


function dollarToBnb(number) {
    const dollar = number * bnbValueOfOneDollar;
    // console.log(dollar);
    return dollar;
};

module.exports = {
    getAllTransactions,
    getTransaction,
    getBalanceOfEth,
    getBalanceOfBnb,
    createTransaction,
    sendTransaction
};