require("dotenv").config();
const Web3 = require("web3");
const Trx = require("ethereumjs-tx").Transaction;
const common = require("ethereumjs-common");

const web3 = new Web3("https://ropsten.infura.io/v3/3c5dbe2ec25f46da984eb5951ca5b19a");

// Tron Connection
const TronWeb = require("tronweb");
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.shasta.trongrid.io/");
const solidityNode = new HttpProvider("https://api.shasta.trongrid.io/");
const eventServer = new HttpProvider("https://api.shasta.trongrid.io/");
const privateKey = process.env.TRON_PRIVATE_KEY;
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

// Bnb Connection
const bnbAccount1 = "0x8a13cd53130d3A44162b91281F723096fece408c";
const bnbAccount2 = "0x91F1994e516037C6Aa2213586503fede4D5eb7ff";

const bnbPrivateKey = Buffer.from(process.env.BNB_PRIVATE_KEY, "hex");

const web3bsc = new Web3(
    new Web3.providers.HttpProvider(
        "https://bsc-testnet.web3api.com/v1/6GMM7M97XKA1GKX8VA62W1QQVKED6FIHSS"
    )
);


(async () => {
    // const newTrxAccount = await tronWeb.createAccount();
    // console.log(newTrxAccount);

    // const getAccount = await tronWeb.trx.getAccount("TQA79oUcQ2wtYHRTho9Q1oqBf5vLBvpXfS");
    // console.log(getAccount);

    const privateKey = process.env.FROM_NEW_TRON_PRIVATE_KEY;
    // console.log(privateKey);

    var fromAddress = "TDBcbqXb7ubiLo2yf9BvVB9iw6J64PrTfN";
    var toAddress = "TQA79oUcQ2wtYHRTho9Q1oqBf5vLBvpXfS";
    var amount = 10000;
    //Creates an unsigned TRX transfer transaction
    try {
        const tradeobj = await tronWeb.transactionBuilder.sendTrx(
            toAddress,
            amount,
            fromAddress
        );
        const signedtxn = await tronWeb.trx.sign(
            tradeobj,
            privateKey
        );
        const receipt = await tronWeb.trx.sendRawTransaction(
            signedtxn
        );
        // console.log('- Output:', receipt, '\n');

        console.log(receipt);

        const transaction = await tronWeb.trx.getTransaction(receipt.txid);
        console.log(transaction);

        const recentTransactionDetailsOfUser = transaction.raw_data.contract.pop();
        console.log(recentTransactionDetailsOfUser);

        const dollars = trxToDollar(recentTransactionDetailsOfUser.parameter.value.amount);
        console.log(dollars);

        const trx = dollarToTRX(dollars);
        console.log(trx);

        const bscTransactionCount = await web3bsc.eth.getTransactionCount(bnbAccount1);

        const trxObject = {
            nonce: web3bsc.utils.toHex(bscTransactionCount),
            to: bnbAccount2,
            value: web3bsc.utils.toHex(web3bsc.utils.toWei(trx.toString(), 'ether')),
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

        const tronTrx = new Trx(trxObject, { common: chain });
        tronTrx.sign(bnbPrivateKey);

        const serializedTransaction = tronTrx.serialize();
        console.log(serializedTransaction);

        const raw = '0x' + serializedTransaction.toString('hex');
        console.log(raw);

        const bnbTransactionHash = await web3bsc.eth.sendSignedTransaction(raw);

        const getBnbTransaction = await web3bsc.eth.getTransaction(bnbTransactionHash.transactionHash);

        console.log(getBnbTransaction);

    } catch (error) {
        console.error(error);
    }

    // const getTransaction = await tronWeb.trx.getTransaction("41ba293c96fb78f85947b3229d5a13ec2983d727531c18213d959e0286d6e82a");
    // console.log(getTransaction.raw_data.contract[4].parameter.value.owner_address);
})();







let dollarValueOfOneTrx = 0.11; // 1 trx is equal to the 0.11 usd
let trxValueOfOneDollar = 9.32; // 1 usd is equal to the 9.32 trx

// const etherToWei = web3.utils.toWei("1", "ether");
// console.log(etherToWei);

function trxToDollar(number) {
    const trx = tronWeb.fromSun(String(number));
    // console.log(trx);
    const trxDollar = trx * dollarValueOfOneTrx;
    return trxDollar;
};


function dollarToTRX(number) {
    const dollar = number * trxValueOfOneDollar;
    // console.log(dollar);
    return dollar;
};

// const tron = trxToDollar("2003903010");
// console.log(tron);

// const trx = dollarToTRX(dollarValueOfOneTrx);
// console.log(trx);