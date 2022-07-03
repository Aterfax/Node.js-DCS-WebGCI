FROM node:16

# Create app directory
WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN npm install

EXPOSE 8081

CMD [ "node", "main.js" ]