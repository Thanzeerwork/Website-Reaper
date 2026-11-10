# Website Reaper — Production Docker Container for Render, Railway & Cloud VPS
FROM node:20-bookworm-slim

# Install Chromium, Wget, CA certificates, and fonts on Debian 12 Bookworm
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    wget \
    ca-certificates \
    fonts-liberation \
    fonts-noto-color-emoji \
    procps \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Configure environment for Puppeteer & Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    CHROME_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    PORT=5050

WORKDIR /app

# Copy dependency specifications and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application files
COPY . .

# Expose default port
EXPOSE 5050

# Use dumb-init to handle process signals and avoid zombie processes in Docker
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start server
CMD ["node", "server.js"]
