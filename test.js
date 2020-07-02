const express = require("express"),
      app = express(),
      {google} = require('googleapis');

function onSignIn(googleUser) {
var profile = googleUser.getBasicProfile();
console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
console.log('Name: ' + profile.getName());
console.log('Image URL: ' + profile.getImageUrl());
console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}

app.set("view engine","ejs");
// app.use(bodyParser.urlencoded({extended:true}));

const YOUR_CLIENT_ID = '941696510446-2444frjglrq8i4laa2dak4fkv20ave0t.apps.googleusercontent.com',
        YOUR_CLIENT_SECRET = 'l4XrWuqbuT1nI6pL7FzyAbUS',
        YOUR_REDIRECT_URL = "https://testoauth-ching.herokuapp.com/authenticated";

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
    res.render("test/googleOauth");
});

app.post("/login",(req,res)=>{

});

app.get("/policy",(req,res)=>{
    res.render("test/policy");
});
app.get("/authenticated",(req,res)=>{
    res.send("Authenticated");
});


app.listen(process.env.PORT || 3000,()=>{
    console.log("server has started!");
});