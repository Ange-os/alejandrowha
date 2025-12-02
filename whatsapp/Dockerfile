FROM node:18-slim

WORKDIR /home/node/app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "index.js"]