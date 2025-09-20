# ---- Build Stage ----
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json và lock file trước (để tận dụng cache)
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build ứng dụng (Next.js sẽ tạo ra thư mục .next)
RUN npm run build

# Chạy ở port 3001
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
