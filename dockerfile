# Use Node.js LTS version
FROM node:lts

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of your application code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build the Next.js application
RUN pnpm build

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
