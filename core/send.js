
const axios = require('axios');

var txATOM = require('../core/transaction.js');

let sendATOM = async function(signatureAPI, network, balance, amountInPrimaryDenomination, amountInLowestDenomination, senderAdd, receiverAdd, user, nonce, accountNum) {
  console.log("signatureAPI", signatureAPI)
  var promise = new Promise(async function(resolve, reject){

    let checkDenomination = await txATOM.checkDenomination(amountInPrimaryDenomination, amountInLowestDenomination);
    if (checkDenomination != "success") return resolve({"message": "denomination is wrong"});

    if(balance > amountInLowestDenomination){
      axios.post(signatureAPI + '/send', {
        network: network,
        amount: amountInLowestDenomination,
        senderAdd: senderAdd,
        receiverAdd: receiverAdd,
        nonce: nonce,
        accountNum: accountNum
      })
      .then(async function (response) {
        signedTx = response["data"]
        console.log("signedTx", signedTx)

        tx = await txATOM.txBroadcast(network, signedTx)
        console.log("tx", tx)

        txATOM.txActionLog(network, user, "send", amountInPrimaryDenomination, "")

        // return res.json({"signedValueTx": signedTx, "txHash": tx});
        resolve({"signedValueTx": signedTx, "txHash": tx});
      })
      .catch(function (error) {
        console.log(error);
      });
    }else{
      //return res.json({"message": "Sender address have insufficient balance"});
      resolve({"message": "Sender address have insufficient balance"});
    }
  });
  return promise;
}


let sendStaggeredATOM = async function(network, balance, amountInPrimaryDenomination, amountInLowestDenomination, senderAdd, receiverAdd, user, useCase, walletName) {
  var promise = new Promise(async function(resolve, reject){

    let checkDenomination = await txATOM.checkDenomination(amountInPrimaryDenomination, amountInLowestDenomination);
    if (checkDenomination != "success") return resolve({"message": "denomination is wrong"});

    if(balance >= amountInLowestDenomination){
      txATOM.txActionLog(network, user, "send::holding area", amountInPrimaryDenomination, "")
      txATOM.txAddHoldingArea(network, user, senderAdd, receiverAdd, amountInPrimaryDenomination, "", "", useCase, walletName)

      resolve({"signedValueTx": "", "txHash": ""});
    }else{
      //return res.json({"message": "Sender address have insufficient balance"});
      resolve({"message": "Sender address have insufficient balance"});
    }
  });
  return promise;
}

let sentFromHoldingArea = async function(network, amount, senderAdd, receiverAdd, user, id, txHash) {
  var promise = new Promise(async function(resolve, reject){
    txATOM.txActionLog(network, user, "sent complete::holding area", amount, "")
    txATOM.txUpdateHoldingArea(network, user, senderAdd, receiverAdd, amount, "", "", id, txHash)

    resolve("done");
  });
  return promise;
}


exports.sendATOM = sendATOM;
exports.sendStaggeredATOM = sendStaggeredATOM;
exports.sentFromHoldingArea = sentFromHoldingArea;
