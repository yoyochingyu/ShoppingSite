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
    redisClient:redisClient,
    // (UNTHINK YET)
    closeInstance:async function shutdown() {
        await new Promise((resolve) => {
            redisClient.quit(() => {
                resolve();
            });
        });
        // redis.quit() creates a thread to close the connection.
        // We wait until all threads have been run once to ensure the connection closes.
        await new Promise(resolve => setImmediate(resolve));
    }
}
