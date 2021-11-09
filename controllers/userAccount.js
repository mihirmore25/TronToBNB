require("dotenv").config();
const Jwt = require("jsonwebtoken");
const User = require("../models/users");
const Account = require("../models/accounts");
const TronWeb = require("tronweb");
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.shasta.trongrid.io/");
const solidityNode = new HttpProvider("https://api.shasta.trongrid.io/");
const eventServer = new HttpProvider("https://api.shasta.trongrid.io/");
const privateKey = process.env.TRON_PRIVATE_KEY;
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);


const getAccounts = (req, res) => {
    Jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }

        (async () => {
            try {
                const user = await User.findOne({ _id: req.params.userId }).populate("accounts");
                res.json({ userAccounts: user });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        })();
    });
};

const createTrxAccount = (req, res) => {
    Jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }

        (async () => {
            try {
                const user = await User.findById(req.params.userId);

                const createdTrxAccount = await tronWeb.createAccount();

                const newAccount = new Account({
                    createdAddress: createdTrxAccount.address.base58,
                    privateKey: createdTrxAccount.privateKey,
                    user: user._id
                });

                const account = await newAccount.save();

                // res.json({ account });

                user.accounts.push(account._id);
                await user.save();
                res.json({ user });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }

        })();
    });
};

module.exports = {
    getAccounts,
    createTrxAccount
};