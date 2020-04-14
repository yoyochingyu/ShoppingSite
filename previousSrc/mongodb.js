// Rename collection
db.newlyProducts.rename('products',(err,result)=>{
    if(err){
      console.log(err);
    }
    else console.log(result);
  });
  
  //  Count documents in a collection
  db.products.estimatedDocumentCount((err,result)=>{
    if(err){
      console.log(err);
    }
    else console.log(result);
  });

  // Remove(drop) a collection
db.products.drop((err)=>{
    if(err){
      console.log(err);
    }
    else console.log("Delete successfully!");
  });

  //**Test Products before insertion*/

  //**Seeding Products */ 
    db.products.deleteMany({},(err,result)=>{
    if(err)
      console.log(err);
    else{
      console.log("deleted!");
      products.forEach((product)=>{
        test(productSchema,product)
        .then((result)=>{
          console.log(result);
          db.products.insertOne(product,(err,result)=>{
            if(err){
              console.log(err);
            }
            else console.log(result);
          });
        })
        .catch((error)=>{
          console.log(error)
        });
      });
      
    } 
  })  

  // Find(return cursor)-each method
  db.products.find({},(err,cursor)=>{
    if(err)
      console.log(err);
    else
      cursor.each((err,product)=>{
        if(err){
          console.log(err);
        }
        else{
          console.log(product);
        }
      })
  })


  // Fake user
var userOne = {firstName:"CHAOCHAO",lastName:"HEIEH",gender:"M",email:"test@test.com",number:"0967393302",password:"test",address:{streetAddress:"7Avenue",state:"Queens",city:"NYC",zip:"104"}};

  //  Seeding users
  db.users.deleteMany({})
  .then((result)=>{
    console.log("Deleted Count : "+result.deletedCount);
    test(userSchema,userOne)
    .then(()=>{
      console.log("Validation Succeeded!");

      // Hash password
      let saltRounds = 12;
      bcrypt.hash(userOne.password,saltRounds)
      .then((hash)=>{
        userOne.password = hash;
        console.log(userOne.password);
        db.users.insertOne(userOne)
        .then(result=>console.log(result.ops));
      })
    }) // deleteMany的then
  })      
  .catch((err)=>{
    console.log(err);
  });