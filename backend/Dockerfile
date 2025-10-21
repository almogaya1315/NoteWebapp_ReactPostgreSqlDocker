# Backend Dockerfile - NestJS API
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build and expose
RUN npm run build
EXPOSE 3000

CMD ["npm", "run", "start:prod"]
