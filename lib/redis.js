const   dotenv = require('dotenv').config(),
        redis = require('redis'),
        redisClient = redis.createClient(6379,`${process.env.REDIS_HOST}`);

// Redis connection
redisClient.on('connect',()=>{
  console.log('Redis server has started!');
});
redisClient.on("error",(err)=>{
  console.log(err);
});

module.exports = {
    redisClient:redisClient
}
// export function closeInstance(callback) {
//     client.quit(callback)
//   }