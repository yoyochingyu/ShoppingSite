const express = require("express"),
      app = express(),
      {google} = require('googleapis');

app.set("view engine","ejs");
// app.use(bodyParser.urlencoded({extended:true}));

const YOUR_CLIENT_ID = '1032735084625-jvs02ge8mjsca6l7ll7f6or2j8fr9q34.apps.googleusercontent.com',
        YOUR_CLIENT_SECRET = '1lMNz8cz21ReMFEwB_Xk6BFe',
        YOUR_REDIRECT_URL = ["http://localhost:3000/oauth2callback","http://localhost:4000/oauth2callback","http://ec2-3-134-58-20.us-east-2.compute.amazonaws.com:4000/oauth2callback"];

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


app.listen(process.env.PORT || 3000,()=>{
    console.log("server has started!");
});