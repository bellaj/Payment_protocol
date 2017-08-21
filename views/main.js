
"use strict";

var bitcore = require('bitcore');

//var Bitcore = require('bitcore-lib');

var PaymentProtocol = require('bitcore-payment-protocol');

 

function f(rawbody ){
try {
 var body = PaymentProtocol.PaymentRequest.decode(rawbody);
var request = (new PaymentProtocol()).makePaymentRequest(body);
//console.log(request.deserialize(rawbody));

var version = request.get('payment_details_version');
var pki_type = request.get('pki_type');
var pki_data = request.get('pki_data');
var serializedDetails = request.get('serialized_payment_details');
var signature = request.get('signature');

// Verify the signature
var verified = request.verify();
alert("signature matches with certificat");
 
 
 
/*****decode payment details sent by the merchant******************/
var decodedDetails = PaymentProtocol.PaymentDetails.decode(serializedDetails);
var details = new PaymentProtocol().makePaymentDetails(decodedDetails);
var network = details.get('network');
var outputs = details.get('outputs');
var time = details.get('time');
var expires = details.get('expires');
var memo = details.get('memo');
var payment_url = details.get('payment_url');
var merchant_data = details.get('merchant_data');

 
 
 
 
var pay_url=merchant_data;   //"bitcoin:****

document.write("<div class='overview'> Please pay to <a href=" +pay_url+ ">"+ pay_url +"</a> </div><br> <div id='qrcode'></div><div id='details'>Payment Details<ul><li>Expiration date: "+expires+"</li><li>Network: "+network+"</li></ul></div>");

var qrcode = new QRCode(document.getElementById("qrcode"), {
	text: pay_url.toString(),
	width: 128,
	height: 128,
	colorDark : "#000000",
	colorLight : "#ffffff",
	correctLevel : QRCode.CorrectLevel.H
});
 
//console.log('merchant_data '+merchant_data);
//console.log(payment_url);

//console.log('****************'+pay());
   } catch (e) {
      console.log(('Could not parse payment protocol: ' + e));
}
 
}

 

function pay(pay_url){
document.write("<div class='overview'> Please pay to <a href=" +pay_url+ ">"+ pay_url +"</a> </div><br> <div id='qrcode'></div> ");
var qrcode = new QRCode(document.getElementById("qrcode"), {
	text: pay_url.toString(),
	width: 128,
	height: 128,
	colorDark : "#000000",
	colorLight : "#ffffff",
	correctLevel : QRCode.CorrectLevel.H
});
}
 
