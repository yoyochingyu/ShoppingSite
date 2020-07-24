const request = require("supertest"),
        app = require("../app"),
        redis = require("../lib/redis"),
        {initDB,getDB} = require("../lib/mongo"),
        seedDB = require("../seed");


beforeAll(()=>{
    initDB((err)=>{
        if(err){
          console.log(err);
        }else{
          db = getDB();
          seedDB(db);
        }
      });
});

afterAll(async () => {
    await redis.closeInstance();
    
});


describe("Testing the landing page",()=>{
    test("Should return status code 200",async()=>{
        setTimeout(async()=>{
            const res = await request(app).get("/");
            expect(res.statusCode).toBe(200);
        },1000);
        
    });
});

describe("Test products route",()=>{
    test("[Show All] Should retrieve 9 products",async()=>{
        const res = await request(app).get("/products?json=true").expect(200);
        expect(res.body.length).toBe(9);
    });
    test("[Category/Accessory] Should retrieve 2 products",async()=>{
        const res = await request(app).get("/products/category/accessory?json=true").expect(200);
        expect(res.body.length).toBe(2);
    });
    test("[Category/Outfit] Should retrieve 7 products",async()=>{
        const res = await request(app).get("/products/category/outfit?json=true").expect(200);
        expect(res.body.length).toBe(7);
    });
    test("[Search] Should retrieve two products after searching for 'boots'",async()=>{
        const res = await request(app).post("/products/search?json=true")
        .send({search:'boots'})
        .expect(200);
        expect(res.body.length).toBe(2);

    });
    test("[Show specific product] ",async()=>{
        const res = await request(app).get("/products/CMS4625913675?json=true").expect(200);
        expect(res.body.productName).toBe("Red Wing Iron Ranger Boots");
        expect(res.body.productId).toBe("CMS4625913675");
        expect(res.body.price).toBe(332);
    });
    // test res.render(failure);
    // test 404;
    
});

