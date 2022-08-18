ARG MY_SERVICE_PORT=5000
#FROM node:latest
FROM public.ecr.aws/bitnami/node:12.22.12-debian-10-r41
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE ${MY_SERVICE_PORT}
CMD [ "node", "index.js" ]
