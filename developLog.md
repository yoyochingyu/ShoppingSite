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
9999. product欄位統一（改寫）
10000. About us頁面建構



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



<p class="card-text">Status</p>
                                        <p class="card-text">Purchase date</p>
                                        <p class="card-text">Expected Delivery date</p>
                                        <p class="card-text">Product name</p>
                                        <p class="card-text">Size</p>
                                        <p class="card-text">Amount</p>
                                        <p class="card-text">Shipping Fee</p>
                                        <p class="card-text">Overall Price</p>