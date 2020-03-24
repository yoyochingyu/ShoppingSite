var express = require("express"),
        app        = express();

// APP CONFIG
app.set("view engine","ejs");
app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.render("index");
});

app.listen(3000,()=>{
    console.log("Server has started!");
});

    