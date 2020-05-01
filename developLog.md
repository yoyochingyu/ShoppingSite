# 待做清單
1. 把商品調uniform sized(不會變形)
2. show.ejs的購物網頁名稱不見了！
3. nav bar調程fixed
4. 調整衣服的大小
5. show.ejs 鼠標移到SML變成手掌
6. button tag裡沒有type="button"可以嘛
7. 缺貨通知ㄋ
8. Select quality的加減動畫
9. search改成在輸入匡裏面的圖示
10. 統一各種spacing
11. arial label by
12. Login的記得我
13. Gender label in register form
14. nav-bar category只要屬標滑上去就自動展開
15. nav-bar collapse的時候右側nav-bar顯示很奇怪
16. 按下cart實不想要focus
17. push時左側內容被吃掉
18. 購物車的content
19. show.ejs的SML尺忖改以buttongroup
20. breadcrumb
Indicate the current page’s location within a navigational hierarchy that automatically adds separators via CSS.
21. carousel
show.ejs 圖片變成幻燈片顯示
22. toggle的時候footer的字不會被往下擠
23. 點擊上方的shopping site也可以回到/products但是不要<a>的底線


# NEXT
~~1. Register form~~
~~2. pushy->cart~~
~~3. Profile page:~~
    ~~1. 個人資料維護~~
    ~~2. 訂單查詢~~
~~4. 尚未login->顯示signin/up~~
    ~~login/register完璧->顯示登出&profile~~
7. login /sign up form根邏輯設計
7-1. 沒有溝agree不讓點register+flash
7-2. user-session是否可以自動匯入，不要每個route都手動
7-3. subscribe 改成boolean
8. 引入資料庫+session
9. user捆綁wishlist跟cart
10. remember me跟session(expire)串聯
11. 404 not found頁面
------------------------------------------
4. Category根fuzzy search的實施
5. cart頁面建構
6. wishlist 根add to cart的邏輯
7. order/product 的schema補上id
8. 用相同信箱註冊？



8888. 管理後台
9999. Billing串階
9999. login/singup不同介面
10000. About us頁面建構
100000. breadcumb(添加路徑)
1. 加flash
2. 加carousel（商品幻燈片）
3. register policy用modal去加
4. pagination去顯示多樣產品
5. spinner 顯示loading畫面？
6. toast顯示chatbox



## JSON
//userID?


# 改寫
1. 把require(動態）改成import（靜態）/export(ES6)
只有動態用require，不然都用import
2. 改寫ES6
3. 改成async
4. checkUser 的function可以在改好看一點

# Confusion
1.<input=button>  & <button> & <a>的不同使用場景


# 閱讀
1. card-group(doc)後面可看一下
2. SML可以看看button(不藥用list)



# RESTful api
 1. Index
 2. New
 3. Edit
 4. Show
 5. Edit
 6. Update
 7. Remove



# 一些有意義的程式片段
```
app.get("/products/:id",(req,res)=>{
    let id = req.params.id;
    let index = 0;
    products.forEach((product,i)=>{
        if(product.id===id){
            return index = i;
        }
    });
    console.log(index);
    res.render("product/show",{product:products[index]});
});
```

```
// Seeding - Mongoose
// products.forEach((product)=>{
//     Product.create(product,(err,result)=>{
//     if(err){
//         console.log(err);
//     }
//     console.log(result);
//     });
// });
```

//order.json先不管size跟color
"size":{
                    "type":"string",
                    "enum":["S","M","L"]
                },

//promise要同層才能往下找catch error，包在裏面的promise沒辦法往外找
