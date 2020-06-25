// var productSchema = require("./lib/schemas/newProduct.json");
{productName:"Polo Ralph Lauren Baseball Cap",productId:"DQS5634952681",description:"For head-to-toe looks, panelled crown with eyelets, embroidered branding, curved peak, adjustable back strap",img:"https://drive.google.com/uc?export=download&id=1IiledbEXJvTyCCYOeXuH1cqgOQTzpVbC",price:35,createdBy:"2013-11-15"}

{productName:"A&F Stretch Denim Jacket",productId:"KSV7891356248",description:"Comfortable denim jacket in new stretch fabric and classic blue wash. Features logo shanks, pockets throughout and logo leather patch at back hem.",img:"https://drive.google.com/uc?export=download&id=1d9rQ2D3TR-e2JgrE1shLe_5L8msWkZVt",price:110,createdBy:"2013-11-18"},
{productName:"Uniqlo U Crew Neck Short-Sleeve T-shirt",productId:"QOC7925364126",description:"A sturdy heavy cotton cloth material made from low-count yarn with a compact knit. It is durable and long lasting and gains character after every wash.",img:"https://drive.google.com/uc?export=download&id=1yS9E59ImBfTX0XCTcie582I5XvPKJocG",price:14.9,createdBy:"2013-11-20"},
{productName:"AE Flex Skinny Pant",productId:"LCM2346924563",description:"Not tight, just right. The most comfortable skinny jeans you've ever tried on.",img:"https://drive.google.com/uc?export=download&id=1VNLSIaiIJnofzlDe80KHk1s0CbYAcKwU",price:37.46,createdBy:"2013-11-25"},
{productName:"Red Wing Iron Ranger Boots",productId:"CMS4625913675",description:"The Iron Ranger is an American icon that is beloved for its standout style and long-lasting construction. With its toe cap, speed hooks, and Vibram® outsole, there’s no mistaking this leather legend.",img:"https://drive.google.com/uc?export=download&id=1sT3ky_goDDnhgnsXCawHmxDWGKcXtXka",price:329.99,createdBy:"2013-11-27"},
{productName:"K9 Sport Sack Backpack",productId:"MDO1635493520",description:"The Sport Sack is a pet carrier built by you! The design is based on years of research and feedback from loyal customers. With additional storage, padding, and ventilation the Sport Sack is built for intermediate hikes, bike rides or any moderate outing you can dream up.",img:"https://drive.google.com/uc?export=download&id=1OHI05tc8ggfv4QcPtAlrYFUDPamu1UGs",price:79.95,createdBy:"2013-11-30"}

//   req.app.db.createCollections("newProducts",{
//     validator:{$jsonSchema:productSchema}
// });

// req.app.db.newProducts.insert(products[0],(err,result)=>{
//     if(err)
//         console.log(err);
//     else console.log(result);
// });
module.exports = seed;
