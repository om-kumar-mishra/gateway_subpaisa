const express = require("express");
const app = express();

app.set("view engine", "html");

app.engine("html", require("ejs").renderFile);

const request = require("request");

const bodyParser = require("body-parser");

const base64 = require("base-64");
const utf8 = require("utf8");
const opn = require("open");
const http = require("http");
var querystring = require("querystring");
const crypto = require("crypto");

const algorithm = "aes-128-cbc";
var authKey = "x0xzPnXsgTq0QqXx";
var authIV = "oLA38cwT6IYNGqb3";

function encrypt(text) {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(authKey), authIV);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("base64");
}

function decrypt(text) {
  // let iv = Buffer.from(text.iv, 'hex');
  // let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(authKey),
    authIV
  );
  let decrypted = decipher.update(Buffer.from(text, "base64"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

//generate random string

function randomStr(len, arr) {
  var ans = "";
  for (var i = len; i > 0; i--) {
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  return ans;
}

app.listen(3000, () => {
  console.log("Application started and Listening on port 3000");
});

// server your css as static
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  var payerName = "Nasir Salmani";
  var payerEmail = "nasir.salmani@sabpaisa.in";
  var payerMobile = "9821890122";
  var clientTxnId = randomStr(20, "12345abcde");
  var amount = 20;
  var clientCode = "LPSD1";
  var transUserName = "Abh789@sp";
  var transUserPassword = "P8c3WQ7ei";
  const callbackUrl = "http://127.0.0.1:3000/getPgRes";
  const channelId = "W";
  const spURL = "https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1"; // Staging environment
  //var spURL = "https://uatsp.sabpaisa.in/SabPaisa/sabPaisaInit"; // UAT environment
  //  var spDomain = 'https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit'; // production environment

  var mcc = "5666";
  var transData = new Date();

  var stringForRequest =
    "payerName=" +
    payerName +
    "&payerEmail=" +
    payerEmail +
    "&payerMobile=" +
    payerMobile +
    "&clientTxnId=" +
    clientTxnId +
    "&amount=" +
    amount +
    "&clientCode=" +
    clientCode +
    "&transUserName=" +
    transUserName +
    "&transUserPassword=" +
    transUserPassword +
    "&callbackUrl=" +
    callbackUrl +
    "&channelId=" +
    channelId +
    "&mcc=" +
    mcc +
    "&transData=" +
    transData;

  console.log("stringForRequest :: " + stringForRequest);

  var encryptedStringForRequest = encrypt(stringForRequest);
  console.log("encryptedStringForRequest :: " + encryptedStringForRequest);

  const formData = {
    spURL: spURL,
    encData: encryptedStringForRequest,
    clientCode: clientCode,
  };

  res.render(__dirname + "/pg-form-request.html", { formData: formData });
});

app.post("/getPgRes", (req, res) => {
  let body = "";
  req.on("data", function (data) {
    body += data;
    
    console.log("sabpaisa response :: " + body);
    var decryptedResponse = decrypt(
      decodeURIComponent(body.split("&")[1].split("=")[1])
    );
  let arr=  decryptedResponse.split("&")
  
    console.log("decryptedResponse :: " +typeof arr);
    arr.forEach((element)=>{
      console.log(element)
    })

    res.render(__dirname + "/pg-form-response.html", {
      decryptedResponse: arr,
    });
  });
});
