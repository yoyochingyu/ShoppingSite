var express = require("express"),
        app        = express();

// APP CONFIG
app.set("view engine","ejs");
app.use(express.static("public"));

// Landing Page
app.get("/",(req,res)=>{
    res.render("index");
});
// Index Route
app.get("/product",(req,res)=>{
    res.render("index");
});

app.listen(3000,()=>{
    console.log("Server has started!");
});

    