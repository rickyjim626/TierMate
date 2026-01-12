FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY prisma ./prisma/

# Install dependencies with bun (much faster)
RUN bun install

# Generate Prisma client
RUN bunx prisma generate

# Copy source code
COPY . .

# Build with bun
RUN bun run build

# Production stage
FROM oven/bun:1-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 3001

CMD ["bun", "run", "dist/main.js"]
