const express = require("express"),
        router = express.Router();
  
// Index Route
router.get("/products",(req,res)=>{
    let db = req.app.db;
    db.products.find({}).toArray() 
    .then((products)=>{
        if(req.query.json === 'true'){
            res.status(200).json(products);
            return;
        }
        res.render("product/index",{products:products,category:null,search:null});
    })
    .catch((err)=>{
        console.log(err);
        res.render("failure");
    }); 
});

// Show Route
router.get("/products/:id",(req,res)=>{
    let db = req.app.db;
    let productId = req.params.id;
    db.products.findOne({productId:productId})
    .then((foundProduct)=>{
        if(foundProduct == null){
            res.render("404");
        }else{
            res.render("product/show",{product:foundProduct});
        }
    })
    .catch((err)=>{
        console.log(err);
        res.render("failure");
    });
});

// Search Route
router.post("/products/search",(req,res)=>{
    let db = req.app.db;
    search = req.body.search;
    db.products.find({$text:{$search:search}}).toArray()
    .then((foundProducts)=>{
        res.render("product/index",{products:foundProducts,category:null,search:search});
    })
    .catch((err)=>{
        console.log(err);
        res.render("failure");
    });
});

// Category route
router.get("/products/category/:detail",(req,res)=>{
    let db = req.app.db;
    detail = req.params.detail;
    db.products.find({category:detail}).toArray()
    .then((foundProducts)=>{
        res.render("product/index",{products:foundProducts,category:detail,search:null});
    })
    .catch((err)=>{
        console.log(err);
        res.render("failure");
    });
});

module.exports = router;