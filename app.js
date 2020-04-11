var express = require("express"),
        app        = express();
        // seed = require("./seed.js"), 
        MongoClient = require('mongodb').MongoClient,
        assert = require('assert'),
        Ajv = require("ajv"),
        productSchema = require("./lib/schemas/product.json");

// db connection
const url = 'mongodb://localhost:27017';
const dbName = 'shoppingSite';
// Setup ajv
var ajv = new Ajv(); // Create Ajv instance(returns an obj)

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
  


    
        

// APP CONFIG
app.set("view engine","ejs");
app.use(express.static("public"));

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
  })
});

// ====================
// User Route
// ====================
app.get("/login",(req,res)=>{
    res.render("user/login");
});

app.get("/profile",(req,res)=>{
    res.render("user/profile",{product:products[2]});
});


app.listen(3000,()=>{
    console.log("Server has started!");
});

});   