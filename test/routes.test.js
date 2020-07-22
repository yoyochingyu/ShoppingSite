const request = require("supertest"),
        app = require("../app");
// const {MongoClient} = require('mongodb');
// const redis = require('redis'),
//       redisClient = redis.createClient(6379,`${process.env.REDIS_HOST}`);


describe("Testing the landing page",()=>{
    // let connection;
    // let db;
    // const url = `${process.env.MONGODB_URL}`; //docker modification
    // const dbName = 'shoppingSite';

    // beforeAll(async () => {
    //     connection = await MongoClient.connect(url, {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true
    //     });
    //     db = await connection.db(dbName);

    //     // Redis connection
    //     redisClient.on('connect',()=>{
    //         console.log('Redis server has started!');
    //     });
    //     redisClient.on("error",(err)=>{
    //         console.log(err);
    //     });
    // });

    // afterAll(async () => {
    //     await connection.close();
    //     await db.close();
    //     await redisClient.quit();
    // });

    test("Should return status code 200",async()=>{
        const res = await request(app).get("/");
        expect(res.statusCode).toBe(200);
    });
});

describe("Test /products route",()=>{
    test("Should retrieve 9 products",async()=>{
            const res = await request(app).get("/products?json=true").expect(200);
            expect(res.body.length).toBe(9);
        });

    

});