const   dotenv = require('dotenv').config(),
        MongoClient = require('mongodb').MongoClient,
        url = `${process.env.MONGODB_URL}`,
        dbName = 'shoppingSite';
let db=null;

module.exports = {
    initDB : function(callback){
        MongoClient.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true },(err,client)=>{
            assert.equal(null,err);
            console.log("Connected successfully to Mongodb");
            db = client.db(dbName);
            
            db.products = db.collection('products');
            db.users = db.collection('users');
            db.orders = db.collection('orders');
            db.admins = db.collection('admins');
            return callback(err);
        });
    },
    getDB:function(){
        return db;
    }


}



          