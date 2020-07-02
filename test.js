const express = require("express"),
      app = express(),
      {google} = require('googleapis');

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
    res.send("homepage");
});
app.get("/login",(req,res)=>{
    res.render("user/googleOauth");
});
app.get("/policy",(req,res)=>{
    res.render("policy");
});
app.get("/authenticated",(req,res)=>{
    res.send("Authenticated");
});


app.listen(process.env.PORT || 3000,()=>{
    console.log("server has started!");
});