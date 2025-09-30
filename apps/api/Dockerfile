FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY prisma ./apps/api/prisma

# Generate Prisma client
WORKDIR /app/apps/api
RUN pnpm db:generate

# Build the application
RUN pnpm build

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["pnpm", "start:prod"]