# DeepPhe Visualizer - Linux Deployment Guide

## Overview

This guide covers deploying the DeepPhe Visualizer (React + Express) to a Linux machine.

## Prerequisites

### On Linux Server

- Node.js 18.x or higher
- npm 8.x or higher
- nginx (optional, for reverse proxy)
- PM2 (optional, for process management)
- 2GB+ RAM recommended
- 2GB+ disk space

## Deployment Methods

Choose one of the following deployment methods:

---

## Method 1: Simple Node.js Deployment (Recommended for Testing)

### Step 1: Prepare the Build on Your Development Machine

```bash
# Navigate to project directory
cd /Volumes/Samsung-Ext/dev/Viz2

# Install dependencies (if not already done)
npm install

# Build the production bundle
npm run build

# This creates the 'build/' directory with optimized static files
```

### Step 2: Transfer Files to Linux Server

Create a deployment package with only necessary files:

```bash
# Create deployment directory
mkdir -p ~/deepphe-deploy
cd ~/deepphe-deploy

# Copy necessary files
cp -r build/ ~/deepphe-deploy/
cp server.js ~/deepphe-deploy/
cp package.json ~/deepphe-deploy/
cp demopatients.sqlite ~/deepphe-deploy/

# Optional: Copy if you have environment-specific configs
# cp .env ~/deepphe-deploy/
```

Transfer to Linux server using one of these methods:

**Option A: Using SCP**

```bash
# From your Mac
scp -r ~/deepphe-deploy user@your-server-ip:/home/user/deepphe-visualizer
```

**Option B: Using rsync**

```bash
# From your Mac
rsync -avz --progress ~/deepphe-deploy/ user@your-server-ip:/home/user/deepphe-visualizer/
```

**Option C: Using Git**

```bash
# Push to your Git repository
git add .
git commit -m "Production build"
git push origin main

# On Linux server
git clone https://github.com/your-repo/deepphe-visualizer.git
cd deepphe-visualizer
```

### Step 3: Setup on Linux Server

```bash
# SSH into your Linux server
ssh user@your-server-ip

# Navigate to deployment directory
cd /home/user/deepphe-visualizer

# Install only production dependencies for the server
npm install --production express

# Start the server
PORT=3000 node server.js
```

The app should now be running at `http://your-server-ip:3000`

---

## Method 2: Production Deployment with PM2 (Recommended for Production)

PM2 is a production process manager for Node.js applications.

### Step 1: Install PM2 on Linux Server

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Step 2: Create PM2 Ecosystem File

On your Linux server, create `ecosystem.config.js`:

```bash
cd /home/user/deepphe-visualizer
nano ecosystem.config.js
```

Add this content:

```javascript
module.exports = {
  apps: [{
    name: 'deepphe-visualizer',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Step 3: Start with PM2

```bash
# Create logs directory
mkdir -p logs

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions output by this command

# Check status
pm2 status

# View logs
pm2 logs deepphe-visualizer

# Other useful PM2 commands:
# pm2 restart deepphe-visualizer
# pm2 stop deepphe-visualizer
# pm2 delete deepphe-visualizer
# pm2 monit
```

---

## Method 3: Production Deployment with Nginx Reverse Proxy

Use nginx as a reverse proxy for better performance and SSL support.

### Step 1: Install Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 2: Configure Nginx

Create nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/deepphe-visualizer
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    # Increase client max body size if needed
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/deepphe-visualizer /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 3: Setup SSL with Let's Encrypt (Optional but Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx  # Ubuntu/Debian
# OR
sudo yum install certbot python3-certbot-nginx  # CentOS/RHEL

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Certbot will automatically configure nginx for SSL

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Method 4: Docker Deployment (Advanced)

### Create Dockerfile

Create `Dockerfile` in your project root:

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files from build stage
COPY --from=build /app/build ./build
COPY --from=build /app/server.js ./
COPY --from=build /app/package*.json ./
COPY --from=build /app/demopatients.sqlite ./

# Install only production dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the server
CMD ["node", "server.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  deepphe-visualizer:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: [ "CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000" ]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

---

## Security Considerations

### 1. Firewall Configuration

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2. Environment Variables

Create `.env` file for sensitive configuration:

```bash
# .env
NODE_ENV=production
PORT=3000
# Add other environment variables as needed
```

**Important**: Never commit `.env` to version control!

### 3. File Permissions

```bash
# Set appropriate permissions
chmod 755 /home/user/deepphe-visualizer
chmod 644 /home/user/deepphe-visualizer/server.js
chmod 644 /home/user/deepphe-visualizer/demopatients.sqlite
```

---

## Monitoring and Maintenance

### View Application Logs

**With PM2:**

```bash
pm2 logs deepphe-visualizer
pm2 logs deepphe-visualizer --lines 100
```

**With systemd:**

```bash
sudo journalctl -u deepphe-visualizer -f
```

### Monitor Resources

```bash
# System resources
htop
# or
top

# PM2 monitoring
pm2 monit

# Disk usage
df -h

# Memory usage
free -m
```

### Backup Database

```bash
# Create backup script
cat > ~/backup-deepphe.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/user/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp /home/user/deepphe-visualizer/demopatients.sqlite $BACKUP_DIR/demopatients_$DATE.sqlite
# Keep only last 7 days of backups
find $BACKUP_DIR -name "demopatients_*.sqlite" -mtime +7 -delete
EOF

chmod +x ~/backup-deepphe.sh

# Add to crontab for daily backups
crontab -e
# Add this line:
# 0 2 * * * /home/user/backup-deepphe.sh
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check if port is already in use
sudo netstat -tlnp | grep 3000
# or
sudo lsof -i :3000

# Check application logs
pm2 logs deepphe-visualizer

# Verify Node.js version
node --version  # Should be 18.x or higher
```

### Out of Memory Errors

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pm2 restart deepphe-visualizer

# Or update ecosystem.config.js:
# node_args: '--max-old-space-size=4096'
```

### Database File Not Found

```bash
# Verify database file exists
ls -la /home/user/deepphe-visualizer/demopatients.sqlite

# Check file permissions
chmod 644 /home/user/deepphe-visualizer/demopatients.sqlite
```

### Nginx 502 Bad Gateway

```bash
# Check if Node.js app is running
pm2 status

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify proxy_pass URL in nginx config
sudo nginx -t
```

---

## Quick Deployment Script

Create an automated deployment script:

```bash
cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Variables
APP_DIR="/home/user/deepphe-visualizer"
BACKUP_DIR="/home/user/backups/$(date +%Y%m%d_%H%M%S)"

# Create backup
echo "📦 Creating backup..."
mkdir -p $BACKUP_DIR
cp -r $APP_DIR $BACKUP_DIR/

# Navigate to app directory
cd $APP_DIR

# Pull latest changes (if using Git)
# git pull origin main

# Install dependencies
echo "📥 Installing dependencies..."
npm install --production

# Restart application
echo "🔄 Restarting application..."
pm2 restart deepphe-visualizer

echo "✅ Deployment complete!"
pm2 status
EOF

chmod +x deploy.sh
```

---

## Performance Optimization

### Enable Compression in Express

Update `server.js`:

```javascript
const express = require("express");
const compression = require("compression");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Enable gzip compression
app.use(compression());

// Serve static files with caching
app.use(express.static(path.join(__dirname, "build"), {
  maxAge: '1y',
  etag: true
}));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

Install compression:

```bash
npm install compression
```

---

## Summary

**For Development/Testing:**

- Use Method 1 (Simple Node.js)

**For Production:**

- Use Method 2 (PM2) + Method 3 (Nginx)
- Enable SSL with Let's Encrypt
- Setup monitoring and backups

**For Scalability:**

- Use Method 4 (Docker)
- Consider Kubernetes for large deployments

## Quick Start (Production)

```bash
# 1. Build on your Mac
npm run build

# 2. Transfer to Linux
scp -r build server.js package.json demopatients.sqlite user@server:/home/user/app/

# 3. On Linux server
ssh user@server
cd /home/user/app
npm install --production express compression
sudo npm install -g pm2
pm2 start server.js --name deepphe
pm2 save
pm2 startup

# 4. Access application
# http://your-server-ip:3000
```

Your DeepPhe Visualizer is now deployed! 🎉

