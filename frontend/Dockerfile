# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and env file
COPY . .

# Set environment variables for production build
ENV NODE_ENV=production
ENV VITE_API_URL=http://10.0.0.9:7315

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Ensure nginx runs in the foreground
CMD ["nginx", "-g", "daemon off;"] 