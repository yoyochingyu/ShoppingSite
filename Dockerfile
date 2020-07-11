FROM node:12.18-alpine
ENV NODE_ENV development
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
# COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"] 
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 4000
CMD npm start