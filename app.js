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
        redisStore = require('connect-redis')(session);
        

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




// app.db=db;
// Seeding
var products = [
  {productName:"High waist mom jeans",productId:"ABC1234567890",description:"High-rise, 5-pocket jeans with zipper fly fastening. Featuring a slightly wide fit that narrows at the ankle and turn-up hems.",img:"https://static.bershka.net/4/photos2/2020/V/0/1/p/0005/352/400/0005352400_1_1_3.jpg?t=1581504083565",price:29.9,createdBy:"2018-11-13"},
  {productName:"Socks",productId:"DEF1234567890", description:"Great socks!",img:"https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/87384972_1385646941616951_1042036671773671424_o.jpg?_nc_cat=100&_nc_sid=8024bb&_nc_oc=AQnIGCoQAEsUGuZkk30rrxvCLHdVLDy7CvjtFD1EJYAmUUHnHYQ9HNJkyl-_R4Zs0Yw&_nc_ht=scontent-tpe1-1.xx&oh=a5be7fe8d9e97af1a56836cc05a5898a&oe=5EA9B299",price:35.9,createdBy:"2018-11-13"},
  {productName:"Cloth",productId:"GHI0987654321",description:"Comfortable",img:"https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/p960x960/87397600_1383931691788476_5847767710611537920_o.jpg?_nc_cat=100&_nc_sid=8024bb&_nc_oc=AQkzOMBzMD01Lr0EIbTqEnnpWRbDyVmwPUaVqL_A6Uhr_c9Ty4AfKYWvun06unHwB4w&_nc_ht=scontent-tpe1-1.xx&_nc_tp=6&oh=fe9faea9b065f30bdfedb247bfe9e644&oe=5EA7E6EA",price:49.9,createdBy:"2018-11-13"},
  {productName:"Two-color cloth",productId:"JKL1234567890",description:"Buy it or not",img:"https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/s960x960/86728222_1376296059218706_4688338866694782976_o.jpg?_nc_cat=104&_nc_sid=8024bb&_nc_oc=AQncGR8P7MTrhsiCGjOJpks_BTIm9UdJ5H8RsejWrs7tw4Cdp5_cMNnRXK06a2Q6jvg&_nc_ht=scontent-tpe1-1.xx&_nc_tp=7&oh=68e18d1a2508820d13b77fc09b729582&oe=5EA98C87",price:10.0,createdBy:"2018-11-13"},
  {productName:"Wallet",productId:"MNO1234567890",description:"Place your cards inside",img:  "https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/83944175_1368630926651886_7148803726516420608_o.jpg?_nc_cat=106&_nc_sid=8024bb&_nc_oc=AQlRsrFbYyST9Slwak1bx7qxNNNJqbY3lovbXhujYAJ36io0858pu92Zs5LQ5iVShKc&_nc_ht=scontent-tpe1-1.xx&oh=ff0d1df67053688cd5c1d660b10cc643&oe=5EAA46FE",price:34.5,createdBy:"2018-11-13"}];
// seed();


// Create user
// db.users.deleteOne({firstName:"test"})
// .then((result)=>{
//   console.log("Deleted User Amount:"+result.result.n);

// })
// .catch((err)=>{console.log(err)});





// Insert orders
// var order1 = {purchaseTime:"2018-11-13T20:20:39+00:00",status:"Processing",expectedDeliveryDate:"2018-11-13",products:[
//   {productName:"High waist mom jeans",productId:"ABC1234567890",price:29.9,amount:1,net:29.9}
// ],shipping:0,overall:29.9
// };

// db.orders.deleteMany({})
// .then((result)=>{
//   console.log("Deleted Order Amount:"+result.result.n);
//   return test(orderSchema,order1);
// })
// .then(()=>{
//     console.log("Validation succeeded!");
//     return db.orders.insertOne(order1);
//   })
// .then((result)=>{
//   console.log(result.ops);
// })
// .catch((err)=>{
//   console.log(err);
// })


// ====================
// Product Route
// ====================

// Session
var userSession=null;

// Landing Page
app.get("/",(req,res)=>{
  res.render("landing",{user:userSession});
});

// Index Route
app.get("/products",(req,res)=>{
  console.log(req.session); //read from redis-store
  userSession = req.session.user; //如果未登入會有問題嘛？
  db.products.find({}).toArray((err,products)=>{
    if(err){
      console.log(err);
    }
    else{
      res.render("product/index",{products:products,user:userSession});
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
      // console.log(foundProduct);
      res.render("product/show",{product:foundProduct,user:userSession});
    }
  });
});

// ====================
// User Route
// ====================
app.get("/login",(req,res)=>{
    res.render("user/login",{user:userSession});
});

app.get("/register",(req,res)=>{
  res.render("user/register",{user:userSession});
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
          req.session.user = foundUser;  //set session data in redis !??<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
          res.redirect("/products");
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
    console.log("Validation succeeds!");

     // Hash password
     let saltRounds = 12;
     bcrypt.hash(inputUser.password,saltRounds)
     .then((hash)=>{
       inputUser.password = hash;
       db.users.insertOne(inputUser)
       .then((result)=>{
        //  console.log(result.ops);
         res.redirect("/products");
        });
     })
  })
  .catch((err)=>{
    console.log(err);
    res.redirect("/register"); //加flash，提示輸入錯誤
  });
});

app.get("/profile",(req,res)=>{
  if(req.session.user){
    res.render("user/profile",{product:products[2],user:userSession});
  }
  else{
    res.redirect("/login");
  }
});

app.get("/logout",(req,res)=>{
  req.session.user = null;
  res.redirect("/products");
});


app.listen(3000,()=>{
    console.log("Server has started!");
});

});   