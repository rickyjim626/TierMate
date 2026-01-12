FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

# Copy package files
COPY package.json ./
COPY prisma ./prisma/

# Install dependencies with bun
RUN bun install

# Generate Prisma client
RUN bunx prisma generate

# Copy source code
COPY . .

# Build
RUN bun run build

# Production stage
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 3001

# Run Prisma db push and start the app
CMD ["sh", "-c", "bunx prisma db push --skip-generate && bun run dist/main.js"]
