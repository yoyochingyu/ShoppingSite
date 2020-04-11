const express = require("express"),
        app        = express();
        // seed = require("./seed.js"), 
        MongoClient = require('mongodb').MongoClient,
        assert = require('assert'),
        Ajv = require("ajv"),
        productSchema = require("./lib/schemas/product.json"),
        userSchema  = require("./lib/schemas/user.json"),
        bcrypt = require("bcrypt"),
        bodyParser = require("body-parser");

// db connection
const url = 'mongodb://localhost:27017';
const dbName = 'shoppingSite';
// Setup ajv
var ajv = new Ajv(); // Create Ajv instance(returns an obj)

// Fake user
var userOne = {firstName:"CHAOCHAO",lastName:"HEIEH",gender:"M",email:"test@test.com",number:"0967393302",password:"test",address:{streetAddress:"7Avenue",state:"Queens",city:"NYC",zip:"104"}};

function test(schema,data){
  return new Promise((resolve,reject)=>{
    var valid = ajv.validate(schema,data); //Validate data using passed schema (it will be compiled and cached)(return boolean)
    if(!valid){
      reject(ajv.errors);
    }
    else resolve(valid);
  });
};



MongoClient.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true },(err,client)=>{
  assert.equal(null,err);
  console.log("Connected successfully to Mongodb");
  const db = client.db(dbName);
  db.products = db.collection('products');
  db.users = db.collection('users');

  

  


    
        

// APP CONFIG
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

// app.db=db;
// Seeding
// seed();

// ====================
// Product Route
// ====================

// Landing Page
app.get("/",(req,res)=>{
    res.render("landing",);
});

// Index Route
app.get("/products",(req,res)=>{
  db.products.find({}).toArray((err,products)=>{
    if(err){
      console.log(err);
    }
    else{
      res.render("product/index",{products:products});
    }
  });
});

// Show Route
app.get("/products/:id",(req,res)=>{
  let productId = req.params.id;
  db.products.findOne({productId:productId},(err,foundProduct)=>{
    if(err){
      console.log(err);
    }
    else{
      console.log(foundProduct);
      res.render("product/show",{product:foundProduct});
    }
  });
});

// ====================
// User Route
// ====================
app.get("/login",(req,res)=>{
    res.render("user/login");
});

app.post("/login",(req,res)=>{
  let inputEmail = req.body.inputEmail;
  let inputPassword = req.body.inputPassword;

  // Define checkUser function
  async function checkUser(inputEmail,inputPassword){
    db.users.findOne({email:inputEmail})
    .then(async(foundUser)=>{
      if(foundUser===null){
        res.send("no user");
      }
      else{
      let match = await bcrypt.compare(inputPassword,foundUser.password);
      console.log(match);
      if(match){
        res.send("Login successfully!");
      }
      else{
        res.send("Wrong Password!");
      }
      }
    })
    
    .catch((err)=>{
      console.log(err)
      res.send(err);
    });
  }

  checkUser(inputEmail,inputPassword)

});

app.get("/profile",(req,res)=>{
    res.render("user/profile",{product:products[2]});
});


app.listen(3000,()=>{
    console.log("Server has started!");
});

});   