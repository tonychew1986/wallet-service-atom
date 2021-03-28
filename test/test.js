const request = require('supertest');
const app = require('../index');
const tx = require('../core/transaction');

var expect  = require('chai').expect;

describe('Basic endpoint to test if service is active', function () {
    it('GET /test', function (done) {
        request(app)
          .get('/test')
          .expect(200)
          .end((err, res) => {
             if (err) {
               return done(err);
             }
             expect(res.text).to.be.equal('test');
             return done();
          });
    });
});

describe('Check database connectivity', function () {
    it('GET /nonce/check', function (done) {
        request(app)
          .get('/nonce/check')
          .expect(200)
          .end((err, res) => {
             if (err) {
               return done(err);
             }
             var resBody = res["body"];
             var nonce = resBody["nonce"];

             expect(nonce).to.satisfy(Number.isInteger);
             return done();
          });
    });
});


describe("Test denomination", function() {
  it("test demonination", async function(){
    let amountPrimary = 0.123;
    let amountLeast = await tx.convertDenomination(amountPrimary);
    amountLeast = Math.floor(amountLeast);

    let checkResult = await tx.checkDenomination(amountPrimary, amountLeast);
    console.log("check result is", checkResult);
    expect(checkResult).to.equal("success");
  });
});