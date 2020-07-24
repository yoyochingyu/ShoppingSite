const   dotenv = require('dotenv').config(),
        MongoClient = require('mongodb').MongoClient,
        url = `${process.env.MONGODB_URL}`,
        dbName = 'shoppingSite',
        seedDB = require("../seed.js");
let db=null;

MongoClient.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true },async(err,client)=>{
    assert.equal(null,err);
    console.log("Connected successfully to Mongodb");
    db = client.db(dbName);
    
    db.products = db.collection('products');
    db.users = db.collection('users');
    db.orders = db.collection('orders');
    db.admins = db.collection('admins');
    await seedDB(db);
    // console.log(db);
    
    // [Error] can not pass to app.js
    module.exports = db;
});


          