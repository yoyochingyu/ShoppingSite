// var productSchema = require("./lib/schemas/newProduct.json");
var products = [
    {name:"High waist mom jeans",description:"High-rise, 5-pocket jeans with zipper fly fastening. Featuring a slightly wide fit that narrows at the ankle and turn-up hems.",image:"https://static.bershka.net/4/photos2/2020/V/0/1/p/0005/352/400/0005352400_1_1_3.jpg?t=1581504083565",price:29.9},
    {productName:"Socks",productId:"EAC1234567890", description:"Great socks!",image:"https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/87384972_1385646941616951_1042036671773671424_o.jpg?_nc_cat=100&_nc_sid=8024bb&_nc_oc=AQnIGCoQAEsUGuZkk30rrxvCLHdVLDy7CvjtFD1EJYAmUUHnHYQ9HNJkyl-_R4Zs0Yw&_nc_ht=scontent-tpe1-1.xx&oh=a5be7fe8d9e97af1a56836cc05a5898a&oe=5EA9B299",price:35.9},
    {productName:"Cloth",productId:"XAC0987654321",description:"Comfortable",image:"https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/p960x960/87397600_1383931691788476_5847767710611537920_o.jpg?_nc_cat=100&_nc_sid=8024bb&_nc_oc=AQkzOMBzMD01Lr0EIbTqEnnpWRbDyVmwPUaVqL_A6Uhr_c9Ty4AfKYWvun06unHwB4w&_nc_ht=scontent-tpe1-1.xx&_nc_tp=6&oh=fe9faea9b065f30bdfedb247bfe9e644&oe=5EA7E6EA",price:49.9},
    {productName:"Two-color cloth",productId:"JAC1234567890",description:"Buy it or not",image:"https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/s960x960/86728222_1376296059218706_4688338866694782976_o.jpg?_nc_cat=104&_nc_sid=8024bb&_nc_oc=AQncGR8P7MTrhsiCGjOJpks_BTIm9UdJ5H8RsejWrs7tw4Cdp5_cMNnRXK06a2Q6jvg&_nc_ht=scontent-tpe1-1.xx&_nc_tp=7&oh=68e18d1a2508820d13b77fc09b729582&oe=5EA98C87",price:10.0},
    {productName:"Wallet",productId:"FAC1234567890",description:"Place your cards inside",image:  "https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/83944175_1368630926651886_7148803726516420608_o.jpg?_nc_cat=106&_nc_sid=8024bb&_nc_oc=AQlRsrFbYyST9Slwak1bx7qxNNNJqbY3lovbXhujYAJ36io0858pu92Zs5LQ5iVShKc&_nc_ht=scontent-tpe1-1.xx&oh=ff0d1df67053688cd5c1d660b10cc643&oe=5EAA46FE",price:34.5}];

req.app.db.createCollections("newProducts",{
    validator:{$jsonSchema:productSchema}
});

req.app.db.newProducts.insert(products[0],(err,result)=>{
    if(err)
        console.log(err);
    else console.log(result);
});
module.exports = seed;
