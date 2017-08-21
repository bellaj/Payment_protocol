//'use strict'; // it disable global var!!
var bitcore = require('bitcore');

delete global._bitcore;
var bitcore_lib = require('bitcore-lib');
var PaymentProtocol = require('bitcore-payment-protocol');
delete global._bitcore;
var explorers = require('bitcore-explorers');
var express = require('express');
var bodyParser = require('body-parser');
var URI = require('bitcore-lib/lib/uri');
var request=require("request");
var fs=require("fs");

var app = express();

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var rawBodyParser = bodyParser.raw({type: PaymentProtocol.PAYMENT_CONTENT_TYPE});

bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;

var insight = new explorers.Insight();
var Script = bitcore.Script;

 
var privateKey = bitcore_lib.PrivateKey();
var publicKey = bitcore_lib.PublicKey(privateKey);
var M_address = bitcore_lib.Address(publicKey, bitcore.Networks.defaultNetwork );
console.log('address is :'+M_address);

/************************************************/
 var bitcoin_der_cert_path ='./key/cert.der';
var mcert= fs.readFileSync(bitcoin_der_cert_path);
var bitcoin_priv_key_path ='./key/key.pem';//v
var mkey= fs.readFileSync(bitcoin_priv_key_path);

 /*******************Server ip **************/
var os = require('os');

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

var IP=addresses[0];
var port=3000;

 /*****************URI composition***************************/

function compose_uri(amount){
var pay_url = "http://"+IP+":"+port+"/request";
var uriString = new URI({
  address: M_address,
  amount : amount, // in satoshis
  message: 'payment request'
});

//var valid = URI.isValid(uriString);
var paymentUri = uriString+"&r="+pay_url;
return paymentUri;
}

/*******************************/

app.get("/", function(req, res){
  res.send('Bitcoin Payment');
});



/*******T*want to pay **********/

app.use(bodyParser.json());

app.post("/want_pay", function(req, res){
 
 
 
var amounx=req.body.amount; 
var resp=compose_uri(amounx)+"?amount="+amounx;
res.send(resp);
});


app.get("/invoice", function(req, res){
  res.set({
  'Content-Type': PaymentProtocol.PAYMENT_REQUEST_CONTENT_TYPE,
  'Content-Length': rawbody.length,
  });
  res.send(rawbody);
});



/*******************************************
TOTAL Clone to delete
******************************************/
app.use(bodyParser.json());   
//Todo: move this functionality from route to cli
app.get("/request", urlencodedParser, function(req, res){

 
  var amount = req.query.amount;  
  var script = Script.buildPublicKeyHashOut(M_address.toString());
 // console.log("starting"+script);

//**************prepare output to request payment ***********//
// define the refund outputs
 var merchant_outputs = []; // Where payment should be sent
  var outputs = new PaymentProtocol().makeOutput();
  outputs.set('amount', amount);
  outputs.set('script', script.toBuffer());
  merchant_outputs.push(outputs.message);

/***************************make payment detail* PaymentRequest message, which contains meta-information about the merchant and a digital signature. *************/
  var details = new PaymentProtocol().makePaymentDetails();
  var now = Date.now() / 1000 | 0;
  details.set('network', 'test');
  details.set('outputs', merchant_outputs);
  details.set('time', now);
  details.set('expires', now + 60 * 60 * 24);
  details.set('memo', 'A payment request from the merchant.');
  details.set('payment_url', "http://"+IP+":"+port+"/payment?id=10");
   details.set('merchant_data', new Buffer(7)); // identify the request
/************** form the request + sign it ***************/
  var request = new PaymentProtocol().makePaymentRequest();
  request.set('payment_details_version', 1);


var certificates = new PaymentProtocol().makeX509Certificates();
certificates.set('certificate',mcert);
request.set('pki_type', 'x509+sha256');
request.set('pki_data', certificates.serialize());
request.set('serialized_payment_details', details.serialize());
request.sign(mkey);

var rawbody = request.serialize();

 

console.log("Your total is " + amount + " Satoshis");
 

/*****************ADDED********************/
  res.set({
    'Content-Type': PaymentProtocol.PAYMENT_REQUEST_CONTENT_TYPE,
    'Content-Length': request.length,
    'Content-Transfer-Encoding': 'binary'
  });
/******************For Browser************************************/
//var buf = new Buffer(rawbody, 'binary').toString('base64');
////res.contentType(PaymentProtocol.PAYMENT_REQUEST_CONTENT_TYPE);
//res.send(buf);
/********************for nodejs client**************************************/
res.status(200).send(rawbody); 
/****************************************************************/
});


 /*****************REceive a pyment  *********/
app.post("/payment", rawBodyParser, function(req, res){

console.log("iddddddddddddddd"+req.query.id);

var body = PaymentProtocol.Payment.decode(req.body);
var payment = new PaymentProtocol().makePayment(body);
var transaction = payment.get('transactions');
var refund_to = payment.get('refund_to'); //output where a refund should be sent. 
var memo = payment.get('memo')
 

  var ack = new PaymentProtocol().makePaymentACK();
  ack.set('payment', payment.message);
  ack.set('memo', 'Payment processed,Thank you !');
  var rawack = ack.serialize();
  res.set({
  'Content-Type': PaymentProtocol.PAYMENT_ACK_CONTENT_TYPE,
  'Content-Length': rawack.length,
  });
  res.send(rawack);

});



 var path    = require("path");
app.use(express.static(path.join(__dirname + '/views')));//middleware
console.log(__dirname + '/views');

app.get('/ind',function(req,res){
       
   res.sendFile(path.join(__dirname+'/views/index.html'));


});



app.listen(port, function(){
  console.log("Server listening on :"+IP+" port 3000");
});
