FROM node:10.15.3-alpine

COPY package*.json ./

RUN npm install

COPY . .

ENTRYPOINT [ "./bin/run" ]
