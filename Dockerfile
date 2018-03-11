FROM node

ADD client.js /client.js
ADD pictures /pictures

CMD ["node","/client.js"] 
