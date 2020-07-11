FROM node:12.18-alpine
ENV NODE_ENV development
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN apk update \
apk install build-essential \
apk install python
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 4000
CMD npm start