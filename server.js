const http = require('http'),
      https = require('https'),
      fs=  require('fs'),
      privateKey  = fs.readFileSync('sslcert/server.key', 'utf8'),
      certificate = fs.readFileSync('sslcert/server.crt', 'utf8'),
      credentials = {key: privateKey, cert: certificate},
      app = require("./app");

// var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// httpServer.listen(4000,()=>{
//   console.log('http server started successfully!');
// });
httpsServer.listen(4000,()=>{
    console.log('HTTPS server started successfully');
});

