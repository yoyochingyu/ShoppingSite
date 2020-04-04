var express = require("express"),
        app        = express(),
        mongoose = require("mongoose"),
        Product = require("./models/product.js"),
        seed = require("./seed.js");

// APP CONFIG
app.set("view engine","ejs");
app.use(express.static("public"));
mongoose.connect('mongodb://localhost:27017/shoppingSite',{useNewUrlParser:true,useFindAndModify:false,useUnifiedTopology:true});

// Seeding
seed();

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

    