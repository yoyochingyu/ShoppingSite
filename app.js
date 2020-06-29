const express = require("express"),
        app        = express();
        // seed = require("./seed.js"), 
        MongoClient = require('mongodb').MongoClient,
        assert = require('assert'),
        Ajv = require("ajv"),
        productSchema = require("./lib/schemas/product.json"),
        userSchema  = require("./lib/schemas/user.json"),
        orderSchema  = require("./lib/schemas/order.json"),
        bcrypt = require("bcrypt"),
        bodyParser = require("body-parser"),
        session = require("express-session"),
        redis = require('redis'),
        redisClient = redis.createClient(),
        redisStore = require('connect-redis')(session),
        methodOverride = require("method-override");
const exitHook = require('exit-hook');
const e = require("express");
const { parse } = require("path");
exitHook(() => {
  console.log('Exiting');
});

// db connection
const url = 'mongodb://localhost:27017';
const dbName = 'shoppingSite';
// Setup ajv
var ajv = new Ajv({allErrors:true}); // Create Ajv instance(returns an obj)

//Testing
function test(schema,data){		
  return new Promise((resolve,reject)=>{		
    var valid = ajv.validate(schema,data); //Validate data using passed schema (it will be compiled and cached)(return boolean)		
    if(!valid){		
      reject(ajv.errors);		
    }		
    else resolve(valid);		
  });		
};

// Parse form string into number to pass test
function parsing(updated){
  if(updated.sizeOption == 'oneSize'){
    updated.size['F'] = parseInt(updated.size['F']);
  }
  else{
    if(updated.sizeOption = 'cloth'){
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

MongoClient.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true },(err,client)=>{
  assert.equal(null,err);
  console.log("Connected successfully to Mongodb");
  const db = client.db(dbName);
  db.products = db.collection('products');
  db.users = db.collection('users');
  db.orders = db.collection('orders');


  // APP CONFIG
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended:true}));
  // Redis connection
  redisClient.on('connect',()=>{
    console.log('Redis server has started!');
  })
  redisClient.on("error",(err)=>{
    console.log(err);
  });

  // Session settings
  app.use(session({
    cookie:{maxAge:1000*60*60*24*3}, // 3 days
    name:'shoppingSiteCookie', 
    resave:false,
    saveUninitialized:false,
    secret:'Odessy is the best game in the world!',
    store: new redisStore({client:redisClient})
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


  // pass user/cart session to "views"
  res.locals.user = req.session.user;
  res.locals.cart=req.session.cart;
  
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


// Delete  user
// db.users.deleteOne({firstName:"admin"})
// .then((result)=>{
//   console.log("Deleted User Amount:"+result.result.n);
// })
// .catch((err)=>{console.log(err)});


// Insert orders

// db.orders.deleteMany({})
// .then((result)=>{
//   console.log("Deleted Order Amount:"+result.result.n);
//   return test(orderSchema,order1);
// })
// .then(()=>{
//     // console.log("Validation succeeded!");
//     return db.orders.insertMany([order1,order2]);
//   })
// .then((result)=>{
//   // console.log(result.ops);
// })
// .catch((err)=>{
//   console.log(err);
// })



// ====================
// Product Route
// ====================
// Landing Page
app.get("/",(req,res)=>{
  res.render("landing");
});

// Index Route
app.get("/products",(req,res)=>{
  db.products.find({}).toArray((err,products)=>{
    if(err){
      console.log(err);
    }
    else{
      res.render("product/index",{products:products,category:null,search:null});
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
      res.render("product/show",{product:foundProduct});
    }
  });
});

// Search Route
app.post("/search",(req,res)=>{
  search = req.body.search;
  db.products.find({$text:{$search:search}}).toArray((err,foundProducts)=>{
    if(err){
      console.log(err);
    }
    else{
      // console.log(foundProducts);
      res.render("product/index",{products:foundProducts,category:null,search:search});
    }
  });
});

// Category route
app.get("/category/:detail",(req,res)=>{
  detail = req.params.detail;
  db.products.find({category:detail}).toArray((err,foundProducts)=>{
    if(err){
      console.log(err);
    }
    else{
      res.render("product/index",{products:foundProducts,category:detail,search:null});
    }
  })
});

// ====================
// User Route
// ====================
app.get("/login",(req,res)=>{
    res.render("user/login");
});

app.get("/register",(req,res)=>{
  res.render("user/register");
});

app.post("/cart",(req,res)=>{
  let input = req.body.cart;
  let returnUrl = "/products/"+input.productId;

   // if user exists(login)=> update db(1 product)
   if(req.session.user!=null){
    db.users.findOneAndUpdate({email:req.session.user.email},{$push:{cart:input}},{returnOriginal:false})
    .then((updateResult)=>{
      // set session data into redis-store
      let updatedUser = updateResult.value;
      req.session.user = updatedUser;
      res.redirect(returnUrl); 
    })
    .catch(err=>console.log(err));
  }
  // if user doesn't exists=>redirect(has been handled in middleware)
  else{
    res.redirect(returnUrl); 
  }
});

app.delete("/cart",(req,res)=>{
  deleteIndex = req.body.deleteIndex;
  if(req.session.user == null){
    req.session.cart.splice(deleteIndex,1);
    res.redirect("/products");
  }else{
    var removed = req.session.user.cart.splice(deleteIndex,1);
    // console.log(removed);
    db.users.findOneAndUpdate({email:req.session.user.email},{$pull:{cart:removed[0]}},(err,result)=>{
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/products");
      }
    });
  }
});
app.post("/purchase",(req,res)=>{
  res.send("Successfully purchase!");
});

app.post("/login",(req,res)=>{
  let inputEmail = req.body.inputEmail;
  let inputPassword = req.body.inputPassword;
  
  // Define checkUser function
  async function checkUser(inputEmail,inputPassword){
    db.users.findOne({email:inputEmail})
    .then(async(foundUser)=>{
      if(foundUser === null){
        res.send("User not found!");
        // res.redirect("/login");
      }
      else{
        let match = await bcrypt.compare(inputPassword,foundUser.password);
        // console.log("isUser:"+match);
        if(match){
          // res.send("Login successfully!");

          // if there's something inside cart =>update cart into user db
          if(req.session.cart!=undefined && req.session.cart!=null){
            db.users.findOneAndUpdate({email:inputEmail},{$push:{cart:{$each:req.session.cart}}},{returnOriginal:false})
            .then((updateResult)=>{
              req.session.user = updateResult.value;  //set session data 
              req.session.cart=undefined;
              res.redirect("/products");
            })
            .catch(err=>console.log(err));
          }
          // if there's nothing inside cart : normal login
          else{
            req.session.user=foundUser;
            res.redirect("/products");
          }
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
  checkUser(inputEmail,inputPassword);
});

app.post("/register",(req,res)=>{
  var inputUser = req.body;
  test(userSchema,inputUser)
  .then(()=>{
    console.log("Register Validation succeeds!");
     // Hash password
     let saltRounds = 12;
    return bcrypt.hash(inputUser.password,saltRounds);
  })
  .then((hash)=>{
    inputUser.password = hash;
    return db.users.insertOne(inputUser);
  })
  .then((result)=>{
    //  console.log(result.ops);
  res.redirect("/products");
  })
  .catch((err)=>{
    console.log(err);
    alert("You've typed something wrong!");
    res.redirect("/register"); //加flash，提示輸入錯誤
  });
});

app.get("/profile",(req,res)=>{
  var wishlistFixed = {productName:"A&F Stretch Denim Jacket",productId:"KSV7891356248",description:"Comfortable denim jacket in new stretch fabric and classic blue wash. Features logo shanks, pockets throughout and logo leather patch at back hem.",img:"https://drive.google.com/uc?export=download&id=1d9rQ2D3TR-e2JgrE1shLe_5L8msWkZVt",price:110,createdBy:"2013-11-18"};
  // console.log(wishlistFixed);
  if(req.session.user){
    // The user has one/multiple order before
    db.orders.find({user_id:req.session.user._id}).toArray()
    .then((foundOrders)=>{
      // console.log(foundOrders);
      res.render("user/profile",{product:wishlistFixed,orders:foundOrders});
    })
    .catch(err=>console.log(err));
  }
  else{
    res.redirect("/login");
  }
});

// Update Profile
app.put("/profile",(req,res)=>{
  // console.log(req.body);
  let inputUser = req.body;
  test(userSchema,inputUser)
  .then((result)=>{
    // console.log(result);
    db.users.findOneAndReplace({email:inputUser.email},inputUser,{returnOriginal:false},(err,result)=>{
      if(err){
        console.log(err);
      }else{
        let updatedUser = result.value;
        // console.log(updatedUser);
        req.session.user = updatedUser;
        alert('Update successfully');
        res.redirect("/profile");
      }
    })
  })
  .catch(err=>console.log(err));
});

app.get("/logout",(req,res)=>{
  req.session.user = null;
  res.redirect("/products");
});
// ===============================
// Admin Route
// ===============================
app.get("/admin/customers",(req,res)=>{
  db.users.find({}).toArray()
  .then((foundCustomers)=>{
    // console.log(foundCustomers);
    res.render("admin/customers",{customers:foundCustomers});
  })
  .catch(err=>console.log(err));
});

app.get("/admin/orders",(req,res)=>{
  db.orders.find({}).toArray()
  .then((foundOrders)=>{
    res.render("admin/orders",{orders:foundOrders});
  })
  .catch(err=>console.log(err));
});

// Index route: Show all products
app.get("/admin/products",(req,res)=>{
  db.products.find({}).toArray()
  .then((foundProducts)=>{
    res.render("admin/products/index",{products:foundProducts});
  })
  .catch(err=>console.log(err));
});
// New route : Show new form
app.get("/admin/products/new",(req,res)=>{
  res.render("admin/products/new");
});


// Create route: handle new route
app.post("/admin/products",(req,res)=>{
  let newProduct = req.body;
  newProduct = parsing(newProduct);
  newProduct.lastModified = new Date().getTime();
  // console.log(newProduct);
  test(productSchema,newProduct)
  .then((result)=>{
    // console.log(result);
    db.products.insertOne(newProduct)
  })
  .then(()=>{
    res.redirect("/admin/products");
  })
  .catch(err=>console.log(err));
});

// Edit route: Show update form
app.get("/admin/products/:id",(req,res)=>{
  let productId = req.params.id;
  db.products.findOne({productId:productId})
  .then((foundProduct)=>{
    res.render("admin/products/edit",{product:foundProduct});
  })
  .catch(err=>console.log(err));
});

// Update Route: Handle update
app.put("/admin/products/:id",(req,res)=>{
  let productId = req.body.productId;
  let updated = req.body;
  let returnURL = "/admin/products/"+productId;
  // Parse string into number to pass test
  updated = parsing(updated);
  updated.lastModified = new Date().getTime();

  // Test and update mongo
  test(productSchema,updated)
  .then((result)=>{
    // console.log(result);
    db.products.replaceOne({productId:productId},updated)
  })  
  .then((updateResult)=>{
    // console.log(updateResult.ops[0]);

    res.redirect(returnURL);
  })
  .catch(err=>console.log(err));
});

// Destroy route: Destroy specific product
app.delete("/admin/products/:id",(req,res)=>{
  let productId = req.params.id;
  db.products.deleteOne({productId:productId})
  .then(()=>{
    res.redirect("/admin/products");
  })
  .catch(err=>console.log(err));
});



app.listen(4000,()=>{
    console.log("Server has started!");
});

});   


 

