var express = require('express')
var router = express.Router()

const axios = require('axios');

var txATOM = require('../core/transaction.js');
var auth = require('../core/auth.js');
var walletSelect = require('../core/wallet-selector.js');

var send = require('../core/send.js');

const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next)




router.get('/test', (req, res) => {
  return res.send('test');
});

router.get('/signature/test', asyncHandler(async (req, res, next) => {
  let network = req.query.network || "testnet";

  let walletName = req.query.wallet || "hot_wallet";
  let signatureAPI = await walletSelect.walletSelector(network, walletName);

  axios.get(signatureAPI + '/test')
  .then(function (response) {
    console.log(response["data"]);
    return res.send(response["data"]);
  })
  .catch(function (error) {
    console.log(error);
  });
}));

router.get('/balance', auth.isAuthorised, asyncHandler(async (req, res, next) => {
  let network = req.query.network || "testnet";
  var senderAdd = req.query.sender_add;

  var senderAddArray = senderAdd.split(',')

  let balanceArray = [];
  console.log("senderAddArray", senderAddArray);

  for(var i=0; i<senderAddArray.length; i++){
    let bal = await txATOM.getBalance(network, senderAddArray[i]);
    balanceArray.push({"address": senderAddArray[i], "balance": bal});
  }

  console.log("balanceArray", balanceArray);

  // need to cater for many addresses as string or array
  // let balance = await txATOM.getBalance(network, senderAdd);

  // return res.json({"address": senderAdd, "balance": balance});
  return res.json(balanceArray);
}));

// API set nonce
router.get('/wallet', auth.isAuthorised, asyncHandler(async (req, res, next) => {
  let network = req.query.network || "testnet";
  let nonceData = await txATOM.checkNonce(network);
  let nonce = nonceData[0]

  data = {
    network: network,
    nonce: nonce
  }

  let walletName = req.query.wallet || "hot_wallet";
  let signatureAPI = await walletSelect.walletSelector(network, walletName);


  if(walletName == "hot_wallet"){
    axios.post(signatureAPI + '/wallet', data)
    .then(function (response) {
      console.log(response["data"]);
      return res.json({"address": response["data"], "nonce": nonce});
    })
    .catch(function (error) {
      console.log(error);
    });
  }else{
    return res.json({"message": "Wallet service requested is not identified as a hot wallet. This endpoint is not required for non hot wallet. Try using /wallet/query endpoint"});
  }
}));

router.get('/wallet/query', auth.isAuthorised, asyncHandler(async (req, res, next) => {
  let network = req.query.network || "testnet";
  let nonce = req.query.nonce;

  let walletName = req.query.wallet || "hot_wallet";
  let signatureAPI = await walletSelect.walletSelector(network, walletName);

  axios.post(signatureAPI + '/wallet', {
    network: network,
    nonce: nonce
  })
  .then(function (response) {
    console.log(response["data"]);
    return res.json({"address": response["data"], "nonce": parseInt(nonce)});
  })
  .catch(function (error) {
    console.log(error);
  });
}));

router.get('/wallet/query/all', auth.isAuthorised, asyncHandler(async (req, res, next) => {
  let network = req.query.network || "testnet";
  let nonce = req.query.nonce;

  let walletName = req.query.wallet || "hot_wallet";
  let signatureAPI = await walletSelect.walletSelector(network, walletName);

  axios.post(signatureAPI + '/wallet/all', {
    network: network,
    nonce: nonce
  })
  .then(function (response) {
    console.log(response["data"]);
    return res.json({"address": response["data"]});
  })
  .catch(function (error) {
    console.log(error);
  });
}));

router.get('/nonce', asyncHandler(async (req, res, next) => {
  let network = req.query.network || "testnet";
  let nonce = await txATOM.checkNonce(network);
  console.log("nonce", nonce);
  return res.json({"nonce": nonce});
}));

router.get('/nonce/check', asyncHandler(async (req, res, next) => {
  let network = req.query.network || "testnet";
  let nonce = await txATOM.getNonceFromDB(network);
  console.log("nonce", nonce);
  return res.json(nonce);
}));

router.get('/nonce/reset', asyncHandler(async (req, res, next) => {
  let network = req.query.network || "testnet";
  let nonce = await txATOM.resetNonce(network);
  console.log("nonce", nonce);
  return res.json({"nonce": nonce});
}));


router.post('/send', asyncHandler(async (req, res, next) => {
  // includeFeeInSentAmount default = true
  // if includeFeeInSentAmount = true, amount = amount - gas
  // if includeFeeInSentAmount = false, amount = amount
  var includeFeeInSentAmount = req.body.include_fee;



  let network = req.body.network || "testnet";
  var amount = req.body.amount_in_atom // 10000
  var senderAdd = req.body.sender_add
  var receiverAdd = req.body.receiver_add
  var user = req.body.user || ""

  let walletName = req.body.wallet || "hot_wallet";
  let signatureAPI = await walletSelect.walletSelector(network, walletName);

  var account = await txATOM.getAccount(senderAdd)
  var accountNum = account.result.value.account_number
  var nonce = account.result.value.sequence

  let balance = await txATOM.getBalance(network, senderAdd);

  console.log("balance", balance)

  var amountInPrimaryDenomination = amount;

  amount = await txATOM.convertDenomination(amount);

  amount = Math.floor(amount);

  var amountInLowestDenomination = amount;

  let response = await send.sendATOM(signatureAPI, network, balance, amountInPrimaryDenomination, amountInLowestDenomination, senderAdd, receiverAdd, nonce, accountNum);
  console.log("response", response)


  return res.json(response);
}));



router.post('/stagger/send', auth.isAuthorised, asyncHandler(async (req, res, next) => {
  let network = req.body.network || "testnet";
  var amount = req.body.amount_in_atom.toString();
  var senderAdd = req.body.sender_add;
  var receiverAdd = req.body.receiver_add;

  var useCase = req.body.use_case;

  var wallet = req.body.wallet || "hot_wallet";

  var user = req.body.user || ""

  let balance = await txATOM.getBalance(network, senderAdd);

  console.log("balance", balance)

  var amountInPrimaryDenomination = amount;

  amount = await txATOM.convertDenomination(amount);

  amount = Math.floor(amount);

  var amountInLowestDenomination = amount;


  let response = await send.sendStaggeredATOM(network, balance, amountInPrimaryDenomination, amountInLowestDenomination, senderAdd, receiverAdd, user, useCase, wallet);
  console.log("response", response)

  return res.json(response);
}));

router.post('/holding-area', auth.isAuthorised, asyncHandler(async (req, res, next) => {
  let network = req.body.network || "testnet";
  let pageSize = req.body.page_size || "20";
  let pageNum = req.body.page_num || "0";

  let filterProcessed = req.body.filter_processed || "0";
  let filterFlagged = req.body.filter_flagged || "0";

  // add filter by wallet option
  let wallet = req.body.wallet || "hot_wallet";

  let response = await txATOM.txCheckHoldingArea(network, 0, pageSize, pageNum, filterProcessed, filterFlagged);

  return res.json(response);
}));

router.post('/holding-area/flag', auth.isAuthorised, asyncHandler(async (req, res, next) => {
  let network = req.body.network || "testnet";
  let id = req.body.id;
  let senderAdd = req.body.sender_addr;
  let receiverAdd = req.body.receiver_addr;
  let flagged = req.body.flagged;

  if(flagged == 'false' || flagged == false || flagged == '0' || flagged == 0){
    // not flagged
    flagged = false;
  }else{
    // flagged
    flagged = true;
  }

  let response = await txATOM.txHoldingAreaToggleFlag(network, id, senderAdd, receiverAdd, flagged);
  console.log("response", response)

  return res.json(response);
}));

router.post('/holding-area/send', auth.isAuthorised, asyncHandler(async (req, res, next) => {
  let network = req.body.network || "testnet";
  let user = req.body.user || "";

  let walletName = req.body.wallet || "hot_wallet";
  let signatureAPI = await walletSelect.walletSelector(network, walletName);

  let holdingBalanceTxs = await txATOM.txCheckHoldingArea(network, 0);
  console.log("holdingBalanceTxs", holdingBalanceTxs)

  // let gas = await txBTC.getEstimatedGas();

  let transferDelay = 60;

  console.log("holdingBalanceTxs.length", holdingBalanceTxs.length)

  let addressNonceArray = [];

  for(var i = 0; i < holdingBalanceTxs.length; i++){
    let id = holdingBalanceTxs[i]["id"];
    let senderAdd = holdingBalanceTxs[i]["sender_addr"];
    let receiverAdd = holdingBalanceTxs[i]["receiver_addr"];
    let amount = holdingBalanceTxs[i]["amount"];
    let token = holdingBalanceTxs[i]["token"];
    let data = holdingBalanceTxs[i]["data"];
    let processed = holdingBalanceTxs[i]["processed"];
    let flagged = holdingBalanceTxs[i]["flagged"];

    console.log("id", id)

    if(processed == 0){
      if(flagged == 0){

        let nonce = 0;
        let accountNum = 0;

        for(var r=0; r<addressNonceArray.length; r++){
          if(addressNonceArray[r][0] == senderAdd){
            nonce = addressNonceArray[r][1] + 1;
          }
        }

        if(nonce == 0){
          var account = await txATOM.getAccount(senderAdd)
          accountNum = account.result.value.account_number
          nonce = account.result.value.sequence

          addressNonceArray.push([[senderAdd, nonce]]);
        }

        console.log("addressNonceArray", addressNonceArray)

        let balance = await txATOM.getBalance(network, senderAdd);

        console.log("balance", balance)

        var amountInPrimaryDenomination = amount;

        amount = await txATOM.convertDenomination(amount);

        amount = Math.floor(amount);

        var amountInLowestDenomination = amount;

        let response = await send.sendATOM(signatureAPI, network, balance, amountInPrimaryDenomination, amountInLowestDenomination, senderAdd, receiverAdd, nonce, accountNum);

        console.log("response", response)

        let txHash = response["txHash"];

        console.log("txHash", txHash)

        if(txHash !== ""){
          let individualResult = await send.sentFromHoldingArea(network, amountInPrimaryDenomination, senderAdd, receiverAdd, user, id, txHash);

          console.log("individualResult", individualResult)

          await sleep(transferDelay * 1000)
        }
      }else{
        console.log("transaction flagged")
      }
    }
  }

  return res.json(holdingBalanceTxs);
}));


router.post('/delegate', asyncHandler(async (req, res, next) => {
  let network = req.body.network || "testnet";
  var amount = req.body.amount_in_atom // 10000
  var senderAdd = req.body.sender_add
  var receiverAdd = req.body.receiver_add
  var user = req.body.user || ""

  let walletName = req.body.wallet || "hot_wallet";
  let signatureAPI = await walletSelect.walletSelector(network, walletName);

  var account = await txATOM.getAccount(senderAdd)
  var accountNum = account.result.value.account_number
  var nonce = account.result.value.sequence

  axios.post(signatureAPI + '/delegate', {
    network: network,
    amount: amount,
    senderAdd: senderAdd,
    receiverAdd: receiverAdd, //validatorRockX,
    nonce: nonce,
    accountNum: accountNum
  })
  .then(async function (response) {
    signedTx = response["data"]
    console.log("signedTx", signedTx)

    tx = await txATOM.txBroadcast(signedTx)
    console.log("tx", tx)

    txATOM.txActionLog(network, user, "delegate", amount, "")

    // return res.json({"signedValueTx": signedTx});
    return res.json({"signedValueTx": signedTx, "txHash": tx});
  })
  .catch(function (error) {
    console.log(error);
  });
}));

router.post('/undelegate', asyncHandler(async (req, res, next) => {
  let network = req.body.network || "testnet";
  var amount = req.body.amount_in_atom // 10000
  var senderAdd = req.body.sender_add
  // var receiverAdd = req.body.receiver_add
  var user = req.body.user || ""

  let walletName = req.body.wallet || "hot_wallet";
  let signatureAPI = await walletSelect.walletSelector(network, walletName);

  var account = await txATOM.getAccount(senderAdd)
  var accountNum = account.result.value.account_number
  var nonce = account.result.value.sequence


  axios.post(signatureAPI + '/undelegate', {
    network: network,
    amount: amount,
    senderAdd: senderAdd,
    receiverAdd: validatorRockX,
    nonce: nonce,
    accountNum: accountNum
  })
  .then(async function (response) {
    signedTx = response["data"]
    console.log("signedTx", signedTx)

    tx = await txATOM.txBroadcast(signedTx)
    console.log("tx", tx)

    txATOM.txActionLog(network, user, "undelegate", amount, "")

    // return res.json({"signedValueTx": signedTx});
    return res.json({"signedValueTx": signedTx, "txHash": tx});
  })
  .catch(function (error) {
    console.log(error);
  });
}));

router.post('/withdraw/reward', asyncHandler(async (req, res, next) => {
  let network = req.body.network || "testnet";
  var senderAdd = req.body.sender_add
  // var receiverAdd = req.body.receiver_add
  var user = req.body.user || ""

  let walletName = req.body.wallet || "hot_wallet";
  let signatureAPI = await walletSelect.walletSelector(network, walletName);

  var account = await txATOM.getAccount(senderAdd)
  var accountNum = account.result.value.account_number
  var nonce = account.result.value.sequence


  axios.post(signatureAPI + '/withdraw/reward', {
    network: network,
    senderAdd: senderAdd,
    receiverAdd: validatorRockX,
    nonce: nonce,
    accountNum: accountNum
  })
  .then(async function (response) {
    signedTx = response["data"]
    console.log("signedTx", signedTx)

    tx = await txATOM.txBroadcast(signedTx)
    console.log("tx", tx)

    txATOM.txActionLog(network, user, "withdraw reward", amount, "")

    // return res.json({"signedValueTx": signedTx});
    return res.json({"signedValueTx": signedTx, "txHash": tx});
  })
  .catch(function (error) {
    console.log(error);
  });
}));

router.get('/explorer/sync/status', asyncHandler(async (req, res, next) => {
  let network = req.query.network || "testnet";
  var address = req.query.address;
  console.log("address", address);

  // let synced = await txBTC.getAddressSync(network, address);
  // console.log("synced", synced);

  return res.json({"synced": true});
}));

// let getBalance = async function(addr) {
//   let bal = await axios.get("http://node01.ip.sx:1317/bank/balances/"+addr)
//   .then(function (response) {
//     return response["data"][0]["amount"];
//   })
//   .catch(function (error) {
//     console.log(error);
//   });
//
//   return bal
// }



module.exports = router
