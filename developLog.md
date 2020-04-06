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
4. Category根fuzzy search的實施
5. cart頁面建構
6. wishlist 根add to cart的邏輯

7. login /sign up form根邏輯設計
8.引入資料庫+session
8888. 管理後台
9999. Billing串階
9999. login/singup不同介面
10000. About us頁面建構



# 改寫
1. 把require(動態）改成import（靜態）/export(ES6)
只有動態用require，不然都用import
2. 改寫ES6
3. 改成async

# Confusion
1.<input=button>  & <button> & <a>的不同使用場景

# 邏輯
1. 尚未login->顯示signin/up
    login/register完璧->顯示登出&profile

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
//Product Detail
var products = [{name:"High waist mom jeans",description:"High-rise, 5-pocket jeans with zipper fly fastening. Featuring a slightly wide fit that narrows at the ankle and turn-up hems.",image:"https://static.bershka.net/4/photos2/2020/V/0/1/p/0005/352/400/0005352400_1_1_3.jpg?t=1581504083565",price:29.9},
{name:"Socks",description:"Great socks!",image:"https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/87384972_1385646941616951_1042036671773671424_o.jpg?_nc_cat=100&_nc_sid=8024bb&_nc_oc=AQnIGCoQAEsUGuZkk30rrxvCLHdVLDy7CvjtFD1EJYAmUUHnHYQ9HNJkyl-_R4Zs0Yw&_nc_ht=scontent-tpe1-1.xx&oh=a5be7fe8d9e97af1a56836cc05a5898a&oe=5EA9B299",price:35.9},
{name:"Cloth",description:"Comfortable",image:"https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/p960x960/87397600_1383931691788476_5847767710611537920_o.jpg?_nc_cat=100&_nc_sid=8024bb&_nc_oc=AQkzOMBzMD01Lr0EIbTqEnnpWRbDyVmwPUaVqL_A6Uhr_c9Ty4AfKYWvun06unHwB4w&_nc_ht=scontent-tpe1-1.xx&_nc_tp=6&oh=fe9faea9b065f30bdfedb247bfe9e644&oe=5EA7E6EA",price:49.9},
{name:"Two-color cloth",description:"Buy it or not",image:"https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/s960x960/86728222_1376296059218706_4688338866694782976_o.jpg?_nc_cat=104&_nc_sid=8024bb&_nc_oc=AQncGR8P7MTrhsiCGjOJpks_BTIm9UdJ5H8RsejWrs7tw4Cdp5_cMNnRXK06a2Q6jvg&_nc_ht=scontent-tpe1-1.xx&_nc_tp=7&oh=68e18d1a2508820d13b77fc09b729582&oe=5EA98C87",price:10.0},
{name:"Wallet",description:"Place your cards inside",image:  "https://scontent-tpe1-1.xx.fbcdn.net/v/t1.0-9/83944175_1368630926651886_7148803726516420608_o.jpg?_nc_cat=106&_nc_sid=8024bb&_nc_oc=AQlRsrFbYyST9Slwak1bx7qxNNNJqbY3lovbXhujYAJ36io0858pu92Zs5LQ5iVShKc&_nc_ht=scontent-tpe1-1.xx&oh=ff0d1df67053688cd5c1d660b10cc643&oe=5EAA46FE",price:34.5}];

```

```
// Seeding
// products.forEach((product)=>{
//     Product.create(product,(err,result)=>{
//     if(err){
//         console.log(err);
//     }
//     console.log(result);
//     });
// });
```