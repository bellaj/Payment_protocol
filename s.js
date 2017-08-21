var bitcore = require('bitcore');
delete global._bitcore;
var PaymentProtocol = require('bitcore-payment-protocol');
delete global._bitcore;
var explorers = require('bitcore-explorers');
var express = require('express');
var bodyParser = require('body-parser');
var qrcode = require('qrcode-terminal');

var app = express();

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var rawBodyParser = bodyParser.raw({type: PaymentProtocol.PAYMENT_CONTENT_TYPE});

bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;

var insight = new explorers.Insight();
var Script = bitcore.Script;

//Todo: Make HDKey and generate unique Address per transaction
var privKey = new bitcore.PrivateKey();
var address = privKey.toAddress();

var baseUri = "https://example.com/";
var paymentUri = baseUri + "payment";
var qrUri = "bitcoin:?r=" + baseUri + "invoice";

var rawbody;

app.get("/", function(req, response){
  response.send('Payment Protocol Terminal');
});

//Todo: move this functionality from route to cli
app.post("/total", urlencodedParser, function(req, response){
  var now = Date.now() / 1000 | 0;
  var script = Script.buildPublicKeyHashOut(address);

  var amount =  req.body['amount'];

  var outputs = new PaymentProtocol().makeOutput();
  outputs.set('amount', amount);
  outputs.set('script', script.toBuffer());

  var merchant_outputs = [];
  merchant_outputs.push(outputs.message);

  var details = new PaymentProtocol().makePaymentDetails();

  details.set('network', 'test');
  details.set('outputs', merchant_outputs);
  details.set('time', now);
  details.set('expires', now + 60 * 60 * 24);
  details.set('memo', 'A payment request from the merchant.');
  details.set('payment_url', paymentUri);


  var request = new PaymentProtocol().makePaymentRequest();
  request.set('payment_details_version', 1);
  request.set('pki_type', "none");
  request.set('pki_data', "Test Payment Server")
 
  request.set('serialized_payment_details', details.serialize());

  rawbody = request.serialize();

  console.log("Your total is " + amount + " Satoshis");
  //qrcode.generate(qrUri);

response.send(rawbody); 
console.log("your raw");
console.log(rawbody);
var bodk = PaymentProtocol.PaymentRequest.decode(rawbody);
var requestttt = (new PaymentProtocol()).makePaymentRequest(bodk);
var version = requestttt.get('payment_details_version');

  console.log("version id" +version);

});

app.get("/invoice", function(req, response){
  response.set({
  'Content-Type': PaymentProtocol.PAYMENT_REQUEST_CONTENT_TYPE,
  'Content-Length': rawbody.length,
  });
  response.send(rawbody);

});

//Todo: Optional: Broadcast the TX to the network
app.post("/payment", rawBodyParser, function(req, response){



  var body = PaymentProtocol.Payment.decode(req.body);
  var payment = new PaymentProtocol().makePayment(body);
  var transaction = payment.get('transactions');
  console.log(transaction);

  console.log(payment.get('memo'));
  var ack = new PaymentProtocol().makePaymentACK();
  ack.set('payment', payment.message);
  ack.set('memo', 'Thank you for your payment!');
  var rawack = ack.serialize();
  response.set({
  'Content-Type': PaymentProtocol.PAYMENT_ACK_CONTENT_TYPE,
  'Content-Length': rawack.length,
  });
  response.send(rawack);

});

app.listen(3000, function(){
  console.log("Server listening on port 3000");
});
