const express = require("express"),
        router = express.Router(),
        Ajv = require("ajv");

const ajv = new Ajv({allErrors:true}); 

router.get("/admin",(req,res)=>{
    res.redirect("/admin/login");
});

// Login route
router.get("/admin/login",(req,res)=>{
    res.render("admin/login");
});
  
router.post("/admin/login",(req,res)=>{
    let db = req.app.db;
    let inputEmail = req.body.inputEmail;
    let inputPassword = req.body.inputPassword;
    
    // Define checkUser function
    async function checkAdmin(inputEmail,inputPassword){
      db.admins.findOne({email:inputEmail})
      .then(async(foundAdmin)=>{
        if(foundAdmin === null){
          res.send("You don't have permission");
          // res.redirect("/login");
        }
        else{
          let match = await bcrypt.compare(inputPassword,foundAdmin.password);
          // console.log("isUser:"+match);
          if(match){
            //   console.log("Admin confirmed!");
              req.session.admin=foundAdmin; //!!!!!!
              res.redirect("/admin/products");
          }
          else{
            res.send("Wrong Password!");
          }
        }
      })
      .catch((err)=>{
        console.log(err);
      });
    }
    checkAdmin(inputEmail,inputPassword);
});

// Logout
router.get("/admin/logout",(req,res)=>{
    req.session.admin = null;
    res.redirect("/products");
});

// Show all customers
router.get("/admin/customers",(req,res)=>{
    let db = req.app.db;
    if(req.session.admin==null){
      res.redirect("/admin/login");
    }else{
      db.users.find({}).toArray()
      .then((foundCustomers)=>{
        res.render("admin/customers",{customers:foundCustomers});
      })
      .catch((err)=>{
        console.log(err);
        res.render("failure");
      });
    }
});

// Show all orders
router.get("/admin/orders",(req,res)=>{
    let db = req.app.db;
    if(req.session.admin==null){
      res.redirect("/admin/login");
    }else{
      db.orders.find({}).toArray()
      .then((foundOrders)=>{
        res.render("admin/orders",{orders:foundOrders});
      })
      .catch((err)=>{
        console.log(err);
        res.render("failure");
      });
    }
});
  
// Index route: Show all products
router.get("/admin/products",(req,res)=>{
    let db = req.app.db;
    if(req.session.admin==null){
      res.redirect("/admin/login");
    }else{
      db.products.find({}).toArray()
      .then((foundProducts)=>{
        res.render("admin/products/index",{products:foundProducts});
      })
      .catch((err)=>{
        console.log(err);
        res.render("failure");
      });
    }
});
  
// New route : Show new form
router.get("/admin/products/new",(req,res)=>{
    if(req.session.admin==null){
      res.redirect("/admin/login");
    }else{
      res.render("admin/products/new");
    }
});
  
  
// Create route: handle new route
router.post("/admin/products",(req,res)=>{
    let db = req.app.db;
    if(req.session.admin==null){
      res.redirect("/admin/login");
    }else{
      let newProduct = req.body;
      newProduct = parsing(newProduct);
      newProduct.lastModified = new Date().getTime();
      test(productSchema,newProduct)
      .then((testResult)=>{
        return db.products.insertOne(newProduct)
      })
      .then((newProduct)=>{
        res.redirect("/admin/products");
      })
      .catch((err)=>{
        console.log(err);
        res.render("failure");
      });
    }
});
  
// Edit route: Show update form
router.get("/admin/products/:id",(req,res)=>{
    let db = req.app.db;
    if(req.session.admin==null){
      res.redirect("/admin/login");
    }else{
      let productId = req.params.id;
      db.products.findOne({productId:productId})
      .then((foundProduct)=>{
        res.render("admin/products/edit",{product:foundProduct});
      })
      .catch((err)=>{
        console.log(err);
        res.render("failure");
      });
    }
});
  
// Update Route: Handle update
router.put("/admin/products/:id",(req,res)=>{
    let db = req.app.db;
    if(req.session.admin==null){
      res.redirect("/admin/login");
    }else{
      let updated = req.body;
      let productId = req.params.id;
      // Parse string into number to pass test
      updated = parsing(updated);
      updated.lastModified = new Date().getTime();
  
      // Test and update mongo
      test(productSchema,updated)
      .then((testResult)=>{
        return db.products.replaceOne({productId:productId},updated)
      })  
      .then((updateResult)=>{
        res.redirect("/admin/products");
      })
      .catch((err)=>{
        console.log(err);
        res.render("failure");
      });
    }
});
  
// Destroy route: Destroy specific product
router.delete("/admin/products/:id",(req,res)=>{
    let db = req.app.db;
    if(req.session.admin==null){
      res.redirect("/admin/login");
    }else{
      let productId = req.params.id;
      db.products.deleteOne({productId:productId})
      .then(()=>{
        res.redirect("/admin/products");
      })
      .catch((err)=>{
        console.log(err);
        res.render("failure");
      });
    }
});

/** ************* */
/** Blocked Route */
/** ************* */

// router.get("/admin/register",(req,res)=>{
//   res.render("admin/register");
// });

// router.post("/admin/register",(req,res)=>{
//   var inputUser = req.body;
//   // Hash password
//   let saltRounds = 12;
//   bcrypt.hash(inputUser.password,saltRounds)
//   .then((hash)=>{
//     inputUser.password = hash;
//     return db.admins.insertOne(inputUser);
//   })
//   .then((result)=>{
//     //  console.log(result.ops);
//     res.redirect("/admin/products");
//   })
//   .catch((err)=>{
//     console.log(err);
//     res.redirect("/admin/register"); //加flash，提示輸入錯誤
//   });
// });

/** ******** */
/** Function */
/** ******** */

// Parse form string into number to pass test
function parsing(updated){
    if(updated.size.F){
      updated.size['F'] = parseInt(updated.size['F']);
    }
    else{
      if(updated.size.S){
        updated.size['S'] = parseInt(updated.size['S']);
        updated.size['M']= parseInt(updated.size['M']);
        updated.size['L']= parseInt(updated.size['L']);
      }
      if(updated.size["8"]){
        updated.size["8"] = parseInt(updated.size["8"]);
        updated.size["8_5"] = parseInt(updated.size["8_5"]);
        updated.size["9"] = parseInt(updated.size["9"]);
        updated.size["9_5"] = parseInt(updated.size["9_5"]);
        updated.size["10"] = parseInt(updated.size["10"]);
        updated.size["10_5"] = parseInt(updated.size["10_5"]);
        updated.size["11"] = parseInt(updated.size["11"]);
      }
    }
    updated.price = parseInt(updated.price);
    return updated;
}

// Testing with ajv
function test(schema,data){		
    return new Promise((resolve,reject)=>{		
      var valid = ajv.validate(schema,data); //Validate data using passed schema (it will be compiled and cached)(return boolean)		
      if(!valid){		
        reject(ajv.errors);		
      }		
      else resolve(valid);		
    });		
};
module.exports = router;