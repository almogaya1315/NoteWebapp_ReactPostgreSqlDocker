# Frontend Dockerfile - React + Vite
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of frontend code
COPY . .

# Build Vite app
RUN npm run build

# --- Production stage ---
FROM nginx:1.25-alpine

# Copy build output to nginx's web root
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
