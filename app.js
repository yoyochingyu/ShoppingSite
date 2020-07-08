const express = require("express"),
      app        = express();
      // seed = require("./seed.js"), 
      MongoClient = require('mongodb').MongoClient,
      assert = require('assert'),
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



// db connection
const url = 'mongodb://localhost:27017';
const dbName = 'shoppingSite';
// Setup ajv


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

app.use("/",productRoutes);
app.use("/",userRoutes);

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