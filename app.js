const express = require("express"),
      app        = express();
      seedDB = require("./seed.js"), 
      MongoClient = require('mongodb').MongoClient,
      assert = require('assert'),
      productSchema = require("./lib/schemas/product.json"),
      userSchema  = require("./lib/schemas/user.json"),
      orderSchema  = require("./lib/schemas/order.json"),
      dotenv = require('dotenv').config(),
      bcrypt = require("bcryptjs"),
      bodyParser = require("body-parser"),
      session = require("express-session"),
      redis = require("./lib/redis"),
      redisStore = require('connect-redis')(session),
      {google} = require('googleapis'),
      request = require("request"),
      methodOverride = require("method-override");
      

const productRoutes = require("./routes/product"),
      userRoutes  = require("./routes/user"),
      adminRoutes = require("./routes/admin");



// db connection
const url = `${process.env.MONGODB_URL}`; //docker modification
const dbName = 'shoppingSite';


// APP CONFIG
app.set("view engine","ejs");


app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// Session settings
app.use(session({
  cookie:{maxAge:1000*60*60*24*3}, // 3 days
  name:'shoppingSiteCookie', 
  resave:false,
  saveUninitialized:false,
  secret:'Odessy is the best game in the world!',
  store: new redisStore({client:redis.redisClient})
}));

// User Session(every route)
app.use((req,res,next)=>{
  // if there's no user field in session data(first time visits/session data expires)=>set user field to null, so that in "views" we can identify login/logout with null/value
  if(req.session.user == undefined){
    req.session.user = null; 
  }
  // if there's no cart field in session data(first time visits/session data expires)=>set cart field to null, so that in "views" we can use forEach to render products
  if(req.session.cart==undefined){
    req.session.cart=null;
  }
  if(req.session.admin==undefined){
    req.session.admin=null;
  }
  // pass user/cart session to "views"
  res.locals.user = req.session.user;
  res.locals.cart=req.session.cart;
  res.locals.admin=req.session.admin;
  
  // pass cart session to "views"
  // if login=>pass req.session.user.cart to "views"
  if(req.session.user!=null){
    if(req.session.user.cart!=undefined && req.session.user.cart!=null){ //user.cart有可能會undefined嘛？
      res.locals.cart =req.session.user.cart;
    }
  }else{
  // if not login=>pass req.session.cart to "views"
  if(req.session.cart!=undefined && req.session.cart!=null){
    res.locals.cart = req.session.cart;
  }
  }   
  next();
});

// Cart session(cart route only)(for not login only)
app.use("/cart",(req,res,next)=>{
  // if user doesn't exists(not login)=>create cart session
  if(req.session.user  == null){
    if(req.session.cart == undefined || req.session.cart==null){
      req.session.cart=new Array(req.body.cart);
    }
    else{
      if(req.body.cart!=undefined && req.session.cart!=null){
        req.session.cart.push(req.body.cart);
      }
    }
  }
  next();
});


MongoClient.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true },async(err,client)=>{
  assert.equal(null,err);
  console.log("Connected successfully to Mongodb");
  const db = client.db(dbName);
  
  db.products = db.collection('products');
  db.users = db.collection('users');
  db.orders = db.collection('orders');
  db.admins = db.collection('admins');
  await seedDB(db);
  
  app.db = db;
  
  app.use("/",productRoutes);
  app.use("/",userRoutes);
  app.use("/",adminRoutes);

  // Landing Page
  app.get("/",(req,res)=>{
    res.render("landing");
  });

  // 404 Route
  app.get("*",(req,res)=>{
    res.status(404);
    res.render("404");
  });
  
});   

// app.listen(4000,()=>{
//   console.log("Server has started!");
// });


module.exports = app;