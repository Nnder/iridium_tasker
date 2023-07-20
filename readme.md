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
Внутри bot есть свой env со своим конфигом в него и вписывал ссылки с ngrok.

bot api - 3000 порт\
web - 8080 порт

В web app прописывал ссылка на api\
файлы: free.html и time.html