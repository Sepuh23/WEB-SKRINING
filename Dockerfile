# Stage 1: Build Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and build static bundle
COPY . .
RUN npm run build

# Stage 2: Production Lightweight Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend assets and server entry point
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src ./src

EXPOSE 3000

# Start production server using tsx
CMD ["npx", "tsx", "server.ts"]
