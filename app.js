var express = require("express"),
    app            = express();
app.set("view engine","ejs");

app.get("/",(req,res)=>{
    res.send("Homepage!");
});

app.listen(3000,()=>{
    console.log("Server has started!");
});

    