FROM node:19-alpine3.16

RUN mkdir -p /home/node/app

RUN npm i -g nodemon

WORKDIR /home/node/app

COPY package.json ./

RUN npm i

VOLUME /home/node/app
VOLUME /home/node/app/node_modules

CMD [ "node", "./docker/docker_entry.js" ]
