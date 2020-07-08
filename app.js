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
      {google} = require('googleapis'),
      request = require("request"),
      methodOverride = require("method-override"),
      dotenv = require('dotenv').config();

const productRoutes = require("./routes/product"),
      userRoutes  = require("./routes/user"),
      adminRoutes = require("./routes/admin");

// const exitHook = require('exit-hook');
// const e = require("express");
// const { parse } = require("path");
const { ObjectId } = require("mongodb");
// const { promises } = require("fs");
// exitHook(() => {
//   console.log('Exiting');
// });

//Load .env
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENTID,
      CLIENT_SECRET = process.env.GOOGLE_OAUTH_SECRET,
      REDIRECT_URL = process.env.GOOGLE_OAUTH_REDIRECTURL;

// Setup scope for google oauth
const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'openid'
];

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

const consentUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes
});


// db connection
const url = 'mongodb://localhost:27017';
const dbName = 'shoppingSite';
// Setup ajv
var ajv = new Ajv({allErrors:true}); // Create Ajv instance(returns an obj)

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

// Process order
function orderProcess(input,req,db){
  input.user_id = req.session.user._id;
  input.shippingInfo.address = input.address;
  delete input.address;
  input.purchaseTime =new Date().getTime();
  if(input.shippingOption=='express'){
    input.expectedDeliveryDate =input.purchaseTime+259200;
  }else{
    input.expectedDeliveryDate =input.purchaseTime+1209600;
  }
  input.netBeforeShipping = req.session.user.netBeforeShipping;
  input.products = req.session.user.cart;
  input.overall = parseInt(input.overall);
  input.shipping = parseInt(input.shipping);
  input.status = 'Processing';
  input.products.forEach((product)=>{
    parsing(product);
    product.amount = parseInt(product.amount);
    delete product.img;

    // Decrease Inventory
    let fieldName = `size.${product.size}`;
    let update = {"$inc":{}};
    update["$inc"][fieldName]=(-1)*(product.amount);
    db.products.updateOne({productId:product.productId},update)
    .then((updateResult)=>{
      console.log(updateResult.result);
    })
    .catch((err)=>{
      console.log(err);
      res.render("failure");
    });
  });

}

async function authenticateGoogle(req,res,db){
  let code = req.query.code;
  let {tokens} = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  request(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokens.id_token}`,(err,response,body)=>{
    if(err){
      console.log(err);
      res.redirect("/register/new");
    }
    else{
      let Jbody = JSON.parse(body);
      db.users.findOne({email:Jbody.email})
      .then((foundResult)=>{
        if(foundResult==null){
          let userInfo = {firstName:Jbody.given_name,lastName:Jbody.family_name,email:Jbody.email};
          res.render("user/register",{userInfo:userInfo});    
        }else{
          req.session.user = foundResult;
          res.redirect("/products");
        }
      })
      .catch(err=>console.log(err));
    }
  }); 
}

MongoClient.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true },(err,client)=>{
  assert.equal(null,err);
  console.log("Connected successfully to Mongodb");
  const db = client.db(dbName);
  db.products = db.collection('products');
  db.users = db.collection('users');
  db.orders = db.collection('orders');
  db.admins = db.collection('admins');


  // APP CONFIG
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
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
  res.locals.CLIENT_ID = CLIENT_ID;
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

app.db = db;

// Landing Page
app.get("/",(req,res)=>{
  res.render("landing");
});

app.use("/products",productRoutes);

// ====================
// User Route
// ====================
app.get("/login",(req,res)=>{
    res.render("user/login",{consentUrl:consentUrl});
});

app.get("/register",(req,res)=>{
  res.render("user/register-option",{consentUrl:consentUrl});
});

app.get("/register/new",async(req,res)=>{
  if(Object.keys(req.query).length==0){
    // console.log("NEW USER");
    res.render("user/register",{userInfo:null});
  }else{
    authenticateGoogle(req,res,db); //function call
  }
});

app.get("/policy",(req,res)=>{
  res.render("user/policy");
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
  let inputUser = req.body;
  test(userSchema,inputUser)
  .then((testResult)=>{
    return db.users.findOneAndReplace({email:inputUser.email},inputUser,{returnOriginal:false});
  })
  .then((updateResult)=>{
    let updatedUser = updateResult.value;
    req.session.user = updatedUser;
    res.redirect("/profile");
  })
  .catch((err)=>{
    console.log(err);
    res.render("failure");
  })
});

app.delete("/profile",(req,res)=>{
  db.users.deleteOne({firstName:req.session.user.firstName})
  .then((deleteResult)=>{
    console.log(deleteResult.result);
    req.session.user = null;
    res.redirect("/products");
  })
  .catch(err=>console.log(err));
  // res.send("DELETE!");
});

app.get("/logout",(req,res)=>{
  req.session.user = null;
  res.redirect("/products");
});


app.post("/cart",(req,res)=>{
  let input = req.body.cart;
  let returnUrl = "/products/"+input.productId;
  input.net = (input.price)*(input.amount);
   // if user exists(login)=> update db(1 product)
   if(req.session.user!=null){
    db.users.findOneAndUpdate({email:req.session.user.email},{$push:{cart:input}},{returnOriginal:false})
    .then((updateResult)=>{
      // set session data into redis-store
      let updatedUser = updateResult.value;
      req.session.user = updatedUser;
      res.redirect("/products"); 
    })
    .catch(err=>console.log(err));
  }else{
    // if user doesn't exists=>redirect(has been handled in middleware)
    res.redirect("/products"); 
  }
  
});

// Delete cart
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
app.delete("/cart/clear",(req,res)=>{
  if(req.session.user != null){
    // If user has loginned
    db.users.findOneAndUpdate({email:req.session.user.email},{$set:{cart:[]}},{returnOriginal:false})
    .then((updateResult)=>{
      req.session.user.cart = null;
      res.redirect("/products");
    })
    .catch(err=>console.log(err));
  }else{
    req.session.cart = null;
    res.redirect("/products");
  }
  // res.send("Clear all");
})

// Purchase
app.get("/purchase",(req,res)=>{
  var netBeforeShipping = 0;
  if(req.session.user==undefined ||req.session.user==null){
    res.redirect("/login");
  }else{
    var promises = [];
    req.session.user.cart.forEach((cartProduct)=>{
      promises.push(
        db.products.findOne({productId:cartProduct.productId})
        .then((foundProduct)=>{  
          if(foundProduct!=null){
            cartProduct.exist = true;
            let cartSize = cartProduct.size;
            // console.log(foundProduct.size[cartSize]);
            let inventory = foundProduct.size[cartSize];
            if(inventory<cartProduct.amount){
              cartProduct.outOfStock = true;
            }else{
              cartProduct.outOfStock = false;
              netBeforeShipping=netBeforeShipping+cartProduct.net;
            }
          }else{
            cartProduct.exist = false;
          }
        })
        .catch(err=>console.log(err))
      );
    });
    Promise.all(promises).then(()=>{
      req.session.user.netBeforeShipping = netBeforeShipping;
      res.render("purchase/cart");
    })
  }
});

app.get("/purchase/info",(req,res)=>{
  if(req.session.user==undefined ||req.session.user==null){
    res.redirect("/login");
  }else{
    res.render("purchase/info");
  }
});

app.post("/purchase/success",(req,res)=>{
  if(req.session.user==undefined ||req.session.user==null){
    res.redirect("/login");
  }else{
    let input = req.body;
    orderProcess(input,req,db);
    
    // Validate order, Insert order, clear cart
    test(orderSchema,input)
    .then((testResult)=>{
      return db.orders.insertOne(input);
    })
    .then((insertResult)=>{
      let queryId = ObjectId(`${input.user_id}`);
      return db.users.updateOne({_id:queryId},{$unset:{cart:""}});
    })
    .then((updateResult)=>{
      req.session.user.cart = null;
      res.render("purchase/success");
    })
    .catch((err)=>{
      console.log(err);
      res.render("failure");
    });
  }
});


// ===============================
// Admin Route
// ===============================
app.get("/admin/login",(req,res)=>{
  res.render("admin/login");
});

/* Block external register*/
// app.get("/admin/register",(req,res)=>{
//   res.render("admin/register");
// });

// app.post("/admin/register",(req,res)=>{
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


app.post("/admin/login",(req,res)=>{
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
          // res.send("Login successfully!");
            console.log("Admin confirmed!");
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

app.get("/admin/logout",(req,res)=>{
  req.session.admin = null;
  res.redirect("/products");
});

app.get("/admin",(req,res)=>{
  res.redirect("/admin/login");
})

app.get("/admin/customers",(req,res)=>{
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

app.get("/admin/orders",(req,res)=>{
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
app.get("/admin/products",(req,res)=>{
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
app.get("/admin/products/new",(req,res)=>{
  if(req.session.admin==null){
    res.redirect("/admin/login");
  }else{
    res.render("admin/products/new");
  }
});


// Create route: handle new route
app.post("/admin/products",(req,res)=>{
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
app.get("/admin/products/:id",(req,res)=>{
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
app.put("/admin/products/:id",(req,res)=>{
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
app.delete("/admin/products/:id",(req,res)=>{
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
app.get("*",(req,res)=>{
  res.status(404);
  res.render("404");
});


app.listen(4000,()=>{
    console.log("Server has started!");
});

});   