/**Schema & model define*/
var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
    name:String,
    description:String,
    image:String,
    price:Number
});

 module.exports = mongoose.model('Product',productSchema);