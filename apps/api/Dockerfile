FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY apps/api ./apps/api

# Generate Prisma client
RUN cd apps/api && pnpm prisma generate

# Build the application
RUN cd apps/api && pnpm build

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "apps/api/dist/main.js"]
