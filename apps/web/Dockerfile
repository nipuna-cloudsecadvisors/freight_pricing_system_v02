FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY apps/web ./apps/web

# Build the application
RUN cd apps/web && pnpm build

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "apps/web/.next/standalone/server.js"]
