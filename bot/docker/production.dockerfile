FROM node:19-alpine3.16

RUN npm i -g nodemon

RUN mkdir -p /usr/src/app

COPY . /usr/src/app/
WORKDIR /usr/src/app/
RUN npm i

CMD ["npm", "run", "start"]