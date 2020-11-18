# specify the base image
FROM node:10-alpine

# setup working directoty
WORKDIR /app
# copy over package.json file
COPY package.json ./
# run npm install to install all dependencies
RUN npm install
# copy over everything else from post directory(index.js)
COPY ./ ./
#dont send nodemodule

# default comment
CMD ["npm", "start"]