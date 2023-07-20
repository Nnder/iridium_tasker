### Для запуска я использовал ngrok с таким конфигом
```
authtoken: token
tunnels:
first:
addr: 3000
proto: http    
second:
addr: 8080
proto: https
```
В бесплатной версии он давал 2 разных адреса, а настраивать nginx с 2 портами у меня не получилось.
Внутри bot есть свой env со своим конфигом в него и вписывал ссылки с ngrok.\
bot api - 3000 порт(node module express)\
web - 8080 порт (nginx)
***
# WEB
В web app прописывал ссылку на api\
файлы: free.html и time.html
Так и не развернул локальную бд в docker
если поднимать не на хостинге то php postgree будет выкидывать warning прямо на странице

***

# Bot
в боте много что недоделано\
чтоб поднять бота 
```
cd bot
npm i
npm run dev
```

также нужно изменить .env