const express = require("express"),
        router = express.Router(),
        Ajv = require("ajv"),
        { ObjectId } = require("mongodb");

const ajv = new Ajv({allErrors:true}); // Create Ajv instance(returns an obj)

/********************** */
/** Google OAUTH Config */
/********************** */
//Load .env
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENTID,
      CLIENT_SECRET = process.env.GOOGLE_OAUTH_SECRET,
      REDIRECT_URL = process.env.GOOGLE_OAUTH_REDIRECTURL;

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

/********************** */
/** Routes */
/********************** */

// Show policy
router.get("/policy",(req,res)=>{
    res.render("user/policy");
});

// Login Route
router.get("/login",(req,res)=>{
    res.render("user/login",{consentUrl:consentUrl});
});

router.post("/login",(req,res)=>{
    let db = req.app.db;
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
                    .catch(err=>{
                        console.log(err);
                        res.render("failure");
                    });
                    }
                    // if there's nothing inside cart : normal login
                    else{
                        req.session.user=foundUser;
                        res.redirect("/products");
                    }
                }else{
                    res.send("Wrong Password!");
                }
            }
        })
        .catch((err)=>{
            console.log(err);
            res.render("failure");
        });
    }
    checkUser(inputEmail,inputPassword);
});

// Register route
router.get("/register",(req,res)=>{
    res.render("user/register-option",{consentUrl:consentUrl});
});

router.get("/register/new",async(req,res)=>{
    let db = req.app.db;
    // New User form
    if(Object.keys(req.query).length==0){
        res.render("user/register",{userInfo:null});
    }else{
        // Google Oauth login
        authenticateGoogle(req,res,db); 
    }
});

router.post("/register",(req,res)=>{
    let db = req.app.db;    
    var inputUser = req.body;
    test(userSchema,inputUser)
    .then(()=>{
        // console.log("Register Validation succeeds!");
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
        res.redirect("/register"); //add flash to show error
    });
});

// Show Profile
router.get("/profile",(req,res)=>{
    let db = req.app.db;
    var wishlistFixed = {productName:"A&F Stretch Denim Jacket",productId:"KSV7891356248",description:"Comfortable denim jacket in new stretch fabric and classic blue wash. Features logo shanks, pockets throughout and logo leather patch at back hem.",img:"https://drive.google.com/uc?export=download&id=1d9rQ2D3TR-e2JgrE1shLe_5L8msWkZVt",price:110,createdBy:"2013-11-18"};
  if(req.session.user){
    // The user has one/multiple order before
    db.orders.find({user_id:req.session.user._id}).toArray()
    .then((foundOrders)=>{
      // console.log(foundOrders);
      res.render("user/profile",{product:wishlistFixed,orders:foundOrders});
    })
    .catch((err)=>{
        console.log(err);
        res.render("failure");
    });
  }
  else{
    res.redirect("/login");
  }
});

// Update Profile
router.put("/profile",(req,res)=>{
    let db = req.app.db;
    if(req.session.user == null){
        res.redirect("/login");
    }else{
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
        });
    }
});

// Delete account
router.delete("/profile",(req,res)=>{
    let db = req.app.db;
    db.users.deleteOne({firstName:req.session.user.firstName})
    .then((deleteResult)=>{
        // console.log(deleteResult.result);
        req.session.user = null;
        res.redirect("/products");
    })
    .catch((err)=>{
        console.log(err);
        res.render("failure");
    });
});

// Logout
router.get("/logout",(req,res)=>{
  req.session.user = null;
  res.redirect("/products");
});

// Add to cart
router.post("/cart",(req,res)=>{
    let db = req.app.db;
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

// Delete specific cart product
router.delete("/cart",(req,res)=>{
    let db = req.app.db;
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
        res.render("failure");
      }
      else{
        res.redirect("/products");
      }
    });
  }
});

// Delete all cart products
router.delete("/cart/clear",(req,res)=>{
    let db = req.app.db;
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
})

// Purchase Route:Step 1 - Confirm cart
router.get("/purchase",(req,res)=>{
    let db = req.app.db;
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

// Purchase Route:Step 2 - Confirm Info
router.get("/purchase/info",(req,res)=>{
    if(req.session.user==undefined ||req.session.user==null){
        res.redirect("/login");
    }else{
        res.render("purchase/info");
    }
});

// Purchase Route:Step 3 - Order placed
router.post("/purchase/success",(req,res)=>{
    let db = req.app.db;
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

/** ******** */
/** Function */
/** ******** */

// Google authenticate
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
  
      // Decrease Inventory
      let fieldName = `size.${product.size}`;
      let update = {"$inc":{}};
      update["$inc"][fieldName]=(-1)*(product.amount);
      db.products.updateOne({productId:product.productId},update)
      .then((updateResult)=>{
        // console.log(updateResult.result);
      })
      .catch((err)=>{
        console.log(err);
        res.render("failure");
      });
    });
  
}

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