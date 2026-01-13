#!/bin/bash

# DeepPhe Visualizer - Deployment Package Creator
# This script creates a deployment-ready package for Linux servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}DeepPhe Visualizer Deployment Packager${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Configuration
DEPLOY_DIR="deepphe-deploy"
BUILD_DIR="build"

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}Build directory not found. Running build...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}Build failed! Please fix errors and try again.${NC}"
        exit 1
    fi
fi

# Clean up old deployment directory
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}Removing old deployment directory...${NC}"
    rm -rf "$DEPLOY_DIR"
fi

# Create deployment directory
echo -e "${GREEN}Creating deployment package...${NC}"
mkdir -p "$DEPLOY_DIR"

# Copy necessary files
echo "  ✓ Copying build files..."
cp -r "$BUILD_DIR" "$DEPLOY_DIR/"

echo "  ✓ Copying server files..."
cp server.js "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"

echo "  ✓ Copying database..."
cp demopatients.sqlite "$DEPLOY_DIR/"

# Copy optional files if they exist
if [ -f ".env.production" ]; then
    echo "  ✓ Copying environment file..."
    cp .env.production "$DEPLOY_DIR/.env"
fi

# Create minimal package.json for production
echo "  ✓ Creating production package.json..."
cat > "$DEPLOY_DIR/package.json" << 'EOF'
{
  "name": "deepphe-visualizer",
  "version": "2.1.0",
  "description": "DeepPhe Visualizer - Production",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^5.1.0",
    "compression": "^1.7.4"
  }
}
EOF

# Create PM2 ecosystem file
echo "  ✓ Creating PM2 configuration..."
cat > "$DEPLOY_DIR/ecosystem.config.js" << 'EOF'
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
EOF

# Create improved server.js with compression
echo "  ✓ Creating optimized server.js..."
cat > "$DEPLOY_DIR/server.js" << 'EOF'
const express = require("express");
const compression = require("compression");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Enable gzip compression
app.use(compression());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files with caching
app.use(express.static(path.join(__dirname, "build"), {
  maxAge: '1y',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Handle React Router - serve index.html for all routes
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => {
  console.log(`DeepPhe Visualizer running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
EOF

# Create deployment instructions
echo "  ✓ Creating deployment instructions..."
cat > "$DEPLOY_DIR/DEPLOY_INSTRUCTIONS.txt" << 'EOF'
DeepPhe Visualizer - Linux Deployment Instructions
====================================================

QUICK START:
-----------
1. Transfer this entire directory to your Linux server
2. SSH into your server
3. Navigate to this directory
4. Run: npm install
5. Run: npm start

The application will be available at http://your-server-ip:3000


PRODUCTION DEPLOYMENT WITH PM2:
--------------------------------
1. Install PM2 globally:
   sudo npm install -g pm2

2. Install dependencies:
   npm install

3. Start with PM2:
   pm2 start ecosystem.config.js

4. Save PM2 configuration:
   pm2 save

5. Enable PM2 startup on boot:
   pm2 startup
   (follow the command it outputs)

6. Check status:
   pm2 status

7. View logs:
   pm2 logs deepphe-visualizer


USEFUL PM2 COMMANDS:
--------------------
pm2 restart deepphe-visualizer    # Restart app
pm2 stop deepphe-visualizer       # Stop app
pm2 delete deepphe-visualizer     # Remove from PM2
pm2 monit                         # Monitor resources
pm2 logs deepphe-visualizer       # View logs


NGINX REVERSE PROXY (OPTIONAL):
--------------------------------
Install nginx and create config at:
/etc/nginx/sites-available/deepphe-visualizer

See LINUX_DEPLOYMENT.md for full nginx configuration example.


FILES INCLUDED:
---------------
- build/              # Compiled React application
- server.js           # Express server with compression
- package.json        # Production dependencies only
- ecosystem.config.js # PM2 configuration
- demopatients.sqlite # Database file


ENVIRONMENT VARIABLES:
----------------------
PORT=3000              # Server port (default: 3000)
NODE_ENV=production    # Environment mode


TROUBLESHOOTING:
----------------
- Check if port 3000 is in use: sudo lsof -i :3000
- View server logs: pm2 logs deepphe-visualizer
- Check Node version: node --version (requires 18.x+)
- Verify files: ls -la


For complete documentation, see LINUX_DEPLOYMENT.md
EOF

# Create archive
echo -e "${GREEN}Creating deployment archive...${NC}"
tar -czf deepphe-deploy.tar.gz "$DEPLOY_DIR"

# Display summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Package Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📦 Package location: $(pwd)/deepphe-deploy.tar.gz"
echo "📂 Directory: $(pwd)/$DEPLOY_DIR"
echo ""
echo "📊 Package contents:"
du -sh "$DEPLOY_DIR"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Transfer to Linux server:"
echo "   scp deepphe-deploy.tar.gz user@server:/home/user/"
echo ""
echo "2. On Linux server, extract and deploy:"
echo "   tar -xzf deepphe-deploy.tar.gz"
echo "   cd $DEPLOY_DIR"
echo "   npm install"
echo "   sudo npm install -g pm2"
echo "   pm2 start ecosystem.config.js"
echo ""
echo -e "${GREEN}✅ Done!${NC}"

