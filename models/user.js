var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    firstName:String, 
    lastName:String,
    number:String, 
    gender:String,
    email:String,
    password:String,
    address1:String, 
    address2:String, 
    city:String, 
    State:String,
    zip:String
});