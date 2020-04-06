var express = require("express"),
        app        = express();
        // seed = require("./seed.js"), 
        MongoClient = require('mongodb').MongoClient,
        assert = require('assert');


// db connection
const url = 'mongodb://localhost:27017';
const dbName = 'shoppingSite';
const client = new MongoClient(url);

client.connect((err)=>{
    assert.equal(null,err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    insertDocuments(db,()=>{
        findDocuments(db,()=>{
             client.close();
        });
    });
});

const insertDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Insert some documents
    collection.insertMany([
      {a : 1}, {a : 2}, {a : 3}
    ], function(err, result) {
      assert.equal(err, null);
      //如果正確insert的話err=null，assert.equal出來會是1
      assert.equal(3, result.result.n);
    //   console.log('result.result:'+result.result);
      assert.equal(3, result.ops.length);
    //   console.log('result.ops:'+result.ops);
      console.log("Inserted 3 documents into the collection");
      callback();
    });
  }

  const findDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('documents');
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs)
      callback();
    });
  }

        

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
    Product.find({},(err,foundProducts)=>{
        if(err){
            console.log(err);
        }
        res.render("product/index",{products:foundProducts});
    });
});

// Show Route
app.get("/products/:id",(req,res)=>{
    Product.findById(req.params.id,(err,foundProduct)=>{
        if(err){
            console.log(err);
        }
        res.render("product/show",{product:foundProduct});
    });
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

    