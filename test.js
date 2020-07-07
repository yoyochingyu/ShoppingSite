const express = require("express"),
      app = express(),
      {google} = require('googleapis'),
      request = require("request"),
      bodyParser = require("body-parser");


app.set("view engine","ejs");
app.use(bodyParser.json());
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

oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      // store the refresh_token in my database!
      console.log(tokens.refresh_token);
    }
    console.log(tokens.access_token);
  });



app.get("/",(req,res)=>{
    res.render("test/index",{url:url});
});
app.get("/login",(req,res)=>{
    res.render("test/googleOauth",{url:url});
});


app.get("/policy",(req,res)=>{
    res.render("test/policy");
});

app.get("/authenticated",async(req,res)=>{
    const code = req.query.code;
    const {tokens} = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log(tokens);
    request(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokens.id_token}`,(err,response,body)=>{
            if(err){
                console.log(err);
            }
            else{
                res.send(body);
            }
    });
});

app.post("/authenticated",(req,res)=>{
    console.log(req.body);
    res.send("HI");
    // request(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokens.id_token}`,(err,response,body)=>{
    //         if(err){
    //             console.log(err);
    //         }
    //         else{
    //             res.send(body);
    //         }
    // });
})


app.listen(process.env.PORT || 3000,()=>{
    console.log("server has started!");
});