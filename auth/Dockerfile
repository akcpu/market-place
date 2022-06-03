# FROM node:16
# WORKDIR /usr/src/auth
# COPY package*.json ./

# COPY . .
# EXPOSE 3002
# CMD [ "node", "server.js" ]
FROM node:16

COPY . /src

WORKDIR /src

RUN npm install

EXPOSE 3000

CMD npm start