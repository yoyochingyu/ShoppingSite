const express = require("express"),
      app = express(),
      {google} = require('googleapis'),
      request = require("request"),
      bodyParser = require("body-parser"),
      dotenv = require('dotenv').config();

function onSignIn(googleUser) {
var profile = googleUser.getBasicProfile();
console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
console.log('Name: ' + profile.getName());
console.log('Image URL: ' + profile.getImageUrl());
console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}

app.set("view engine","ejs");
app.use(bodyParser.json()); //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// app.use(bodyParser.urlencoded({extended:true}));

const YOUR_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENTID,
        YOUR_CLIENT_SECRET = process.env.GOOGLE_OAUTH_SECRET,
        YOUR_REDIRECT_URL = process.env.GOOGLE_OAUTH_REDIRECTURL;

const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
    ];

const oauth2Client = new google.auth.OAuth2(
    YOUR_CLIENT_ID,
    YOUR_CLIENT_SECRET,
    YOUR_REDIRECT_URL
  );


const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
});

app.get("/",(req,res)=>{
    res.render("test/index",{url:url});
});
app.get("/login",(req,res)=>{
    res.render("test/googleOauth",{url:url});
});

// app.post("/login",(req,res)=>{
//     res.send('HI');
// });

// app.get("/policy",(req,res)=>{
//     res.render("test/policy");
// });
app.get("/authenticated",(req,res)=>{
    code = req.query.code;
    const {tokens} = await oauth2Client.getToken(code,(err,token)=>{
        if(err){
            res.send(err);
        }else{
            oauth2Client.setCredentials(tokens);
        }
    })
    
    // res.send(code);
});


app.listen(process.env.PORT || 3000,()=>{
    console.log("server has started!");
});
