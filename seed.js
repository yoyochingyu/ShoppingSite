var products = [{"productName" : "Polo Ralph Lauren Baseball Cap", "productId" : "DQS5634952680", "description" : "For head-to-toe looks, panelled crown with eyelets, embroidered branding, curved peak, adjustable back strap.", "price" : 44, "img" : "https://shoppingsitepickup.s3.us-east-2.amazonaws.com/beigehat.jpg", "category" : "outfit", "sizeOption" : "oneSize", "size" : { "F" : 3 }, "lastModified" : 1594206932698},
                {"productName" : "A&F Stretch Denim Jacket", "productId" : "KSV7891356248", "description" : "Comfortable denim jacket in new stretch fabric and classic blue wash. Features logo shanks, pockets throughout and logo leather patch at back hem.", "price" : 115, "img" : "https://shoppingsitepickup.s3.us-east-2.amazonaws.com/abercrombie_jacket.jpg", "category" : "outfit", "sizeOption" : "cloth", "size" : { "S" : 8, "M" : 15, "L" : 18 }, "lastModified" : 1593500441735},
                {"productName" : "Uniqlo Short-Sleeve T-shirt", "productId" : "QOC7925364126", "description" : "A sturdy heavy cotton cloth material made from low-count yarn with a compact knit. It is durable and long lasting and gains character after every wash.", "price" : 14, "img" : "https://shoppingsitepickup.s3.us-east-2.amazonaws.com/u.jpg", "category" : "outfit", "sizeOption" : "cloth", "size" : { "S" : 18, "M" : 18, "L" : 18 }, "lastModified" : 1593500450710},
                {"productName" : "AE Flex Skinny Pant", "productId" : "LCM2346924563", "description" : "Not tight, just right. The most comfortable skinny jeans you've ever tried on.", "price" : 37, "img" : "https://shoppingsitepickup.s3.us-east-2.amazonaws.com/jeans+(1).jpg", "category" : "outfit", "sizeOption" : "cloth", "size" : { "S" : 20, "M" : 20, "L" : 20 }, "lastModified" : 1593500456749},
                {"productName" : "Red Wing Iron Ranger Boots", "productId" : "CMS4625913675", "description" : "The Iron Ranger is an American icon that is beloved for its standout style and long-lasting construction. With its toe cap, speed hooks, and Vibram® outsole, there’s no mistaking this leather legend.", "price" : 332, "img" : "https://shoppingsitepickup.s3.us-east-2.amazonaws.com/redWing.jpeg", "category" : "outfit", "sizeOption" : "shoes", "size" : { "8" : 0, "9" : 1, "10" : 0, "11" : 1, "8_5" : 1, "9_5" : 1, "10_5" : 1 }, "lastModified" : 1593402707190},
                {"productName" : "K9 Sport Sack Backpack", "productId" : "MDO1635493520", "description" : "The Sport Sack is a pet carrier built by you! The design is based on years of research and feedback from loyal customers. With additional storage, padding, and ventilation the Sport Sack is built for intermediate hikes, bike rides or any moderate outing you can dream up.", "price" : 79, "img" : "https://shoppingsitepickup.s3.us-east-2.amazonaws.com/k9backpack.jpeg", "category" : "accessory", "sizeOption" : "oneSize", "size" : { "F" : 15 }, "lastModified" : 1593500468076},
                {"productName" : "Dr.Martens 1460 Boots", "productId" : "DEL5632564535", "description" : "The 1460 is the original Dr. Martens boot. Its instantly recognizable DNA looks like this: 8 eyes, classic Dr. Martens Smooth leather, grooved sides, a heel-loop, yellow stitching, and a comfortable, air-cushioned sole.", "price" : 150, "img" : "https://i1.adis.ws/i/drmartens/11822006.80.jpg?$medium$", "category" : "outfit", "sizeOption" : "shoes", "size" : { "8" : 3, "9" : 3, "10" : 3, "11" : 3, "8_5" : 4, "9_5" : 3, "10_5" : 3 }, "lastModified" : 1593500474493},
                {"productName" : "Lost Ka Sword-Fish Surfboard", "productId" : "NGJ5326489523", "description" : "Matt and Kolohe’s good times hometown project. The wave catching and speed of a fish meets the high performance desires of one of the world’s best performance surfers.", "price" : 740, "img" : "https://cdn.shopify.com/s/files/1/0003/1902/9309/products/swordfish_lib_1200x.jpg?v=1586183340", "category" : "accessory", "sizeOption" : "oneSize", "size" : { "F" : 10 }, "lastModified" : 1593500478822 },
                {"productName" : "ROXY 1mm POP Surf Long Sleeve Front Zip Wetsuit Top", "productId" : "LCM5611223399", "description" : "Sustainable style that performs with POP Surf. This light and stretchy front zip neoprene top blends pop printed panelling with cutting-edge innovation of our StretchFlight x3 limestone neoprene for a form-flattering silhouette that's warm, sustainable and stylish.", "price" : 100, "img" : "https://images.boardriders.com/globalGrey/roxy-products/all/default/xlarge/erjw803018_10popsurffzlsjktblck,w_kvd0_frt1.jpg", "category" : "outfit", "sizeOption" : "cloth", "size" : { "S" : 11, "M" : 4, "L" : 5 }, "lastModified" : 1594207124941}
];

function seedDB(db){
    db.products.deleteMany({})
    .then(()=>{
        return db.products.insertMany(products);
    })
    .then((insertResult)=>{
        console.log(`Seeding succeeds:Inserted ${insertResult.result.n} products`);
    })
    .catch(err=>console.log(err));

    db.admins.deleteMany({})
    .then(()=>{
        return db.admins.insertOne({"email" : "admin@admin.com", "password" : "$2b$12$LX.7YBSTM8AsolLNtTJUnOLSBj2Lbzy.uS8tudTJ2o2nHE0in0P2e"});
    })
    .then((insertResult)=>{
        console.log(`Seeding succeeds:Inserted ${insertResult.result.n} admin(s)`);
    })
    .catch(err=>console.log(err))

    db.products.dropIndexes({})
    .then(()=>{
        return db.products.createIndex( { productName: "text", description: "text" } );
    })
    .then(()=>{console.log("Created Index");})
    .catch(err=>console.log(err));
}



module.exports = seedDB;
