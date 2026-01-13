# Deployment Files Summary

## 📁 Files Created for Linux Deployment

### Documentation

1. **LINUX_DEPLOYMENT.md** - Complete deployment guide with all methods
2. **DEPLOYMENT_QUICK_START.md** - Quick reference for common tasks
3. **DEPLOY_INSTRUCTIONS.txt** - Created by deployment script

### Automation Scripts

4. **create-deployment-package.sh** - Automated deployment packager
    - Creates production build
    - Packages only necessary files
    - Generates tar.gz archive
    - Usage: `./create-deployment-package.sh`

### Docker Files

5. **Dockerfile** - Multi-stage Docker build
6. **docker-compose.yml** - Docker Compose configuration
7. **.dockerignore** - Excludes unnecessary files from Docker build

### Configuration Files

8. **ecosystem.config.js** - PM2 process manager configuration (auto-generated)
9. **nginx.conf** - Nginx reverse proxy config (in deployment docs)

---

## 🚀 How to Deploy

### Method 1: Using the Deployment Script (Easiest)

```bash
# 1. Run the script
./create-deployment-package.sh

# 2. Transfer to Linux
scp deepphe-deploy.tar.gz user@server:/home/user/

# 3. On Linux server
ssh user@server
tar -xzf deepphe-deploy.tar.gz
cd deepphe-deploy
npm install
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Method 2: Using Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📦 What the Deployment Package Contains

```
deepphe-deploy/
├── build/                      # React production build
│   ├── index.html
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── media/
│   └── ...
├── server.js                   # Optimized Express server
├── package.json                # Production dependencies only
├── ecosystem.config.js         # PM2 configuration
├── demopatients.sqlite         # Database file
└── DEPLOY_INSTRUCTIONS.txt     # Quick reference
```

**Package size:** ~50-100MB (compressed: ~15-30MB)

---

## 🎯 Deployment Scenarios

### Scenario 1: Internal Server (No Domain)

- Use Method 1 (PM2)
- Access via: http://server-ip:3000
- Time: 5 minutes

### Scenario 2: Production with Domain

- Use Method 1 (PM2) + Nginx
- Configure domain DNS
- Install SSL certificate
- Access via: https://your-domain.com
- Time: 15 minutes

### Scenario 3: Containerized Deployment

- Use Method 2 (Docker)
- Portable and reproducible
- Easy scaling
- Time: 3 minutes

### Scenario 4: Development/Testing

- Simple Node.js (no PM2)
- Just run: `node server.js`
- Time: 2 minutes

---

## 🔒 Security Features Included

✅ Gzip compression enabled
✅ Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
✅ Static file caching
✅ Non-root user in Docker
✅ Graceful shutdown handling
✅ Health checks
✅ Log rotation (via PM2)

---

## 📊 Resource Requirements

**Minimum:**

- 1 CPU core
- 1GB RAM
- 2GB disk space
- Node.js 18.x

**Recommended:**

- 2 CPU cores
- 2GB RAM
- 5GB disk space
- Node.js 18.x or 20.x

---

## 🔄 Update Process

### Update Application Code

```bash
# 1. Build new version on your Mac
npm run build

# 2. Create new deployment package
./create-deployment-package.sh

# 3. Transfer to server
scp deepphe-deploy.tar.gz user@server:/home/user/

# 4. On server
ssh user@server
cd /home/user/deepphe-deploy
pm2 stop deepphe-visualizer
rm -rf build/
tar -xzf ../deepphe-deploy.tar.gz --strip-components=1
pm2 start deepphe-visualizer
```

### Update Database Only

```bash
# Transfer new database
scp demopatients.sqlite user@server:/home/user/deepphe-deploy/

# Restart application
pm2 restart deepphe-visualizer
```

---

## 📝 Environment Variables

Create `.env` file on server:

```bash
NODE_ENV=production
PORT=3000
# Add other variables as needed
```

---

## 🎨 Customization

### Change Port

**PM2:** Edit `ecosystem.config.js`

```javascript
env: {
  PORT: 8080  // Change here
}
```

**Docker:** Edit `docker-compose.yml`

```yaml
ports:
  - "8080:3000"  # Change external port
```

### Add Environment Variables

**PM2:** Edit `ecosystem.config.js`

```javascript
env: {
  NODE_ENV: 'production',
    PORT
:
  3000,
    MY_VAR
:
  'my_value'
}
```

**Docker:** Edit `docker-compose.yml`

```yaml
environment:
  - MY_VAR=my_value
```

---

## 🧪 Testing Deployment

Before deploying to production, test locally:

```bash
# Build
npm run build

# Test server locally
node server.js

# Visit http://localhost:3000
```

With Docker:

```bash
# Build and test
docker-compose up

# Visit http://localhost:3000
```

---

## 📈 Monitoring

### PM2 Monitoring

```bash
pm2 monit              # Real-time monitoring
pm2 status             # Application status
pm2 logs               # View logs
pm2 describe <app>     # Detailed info
```

### Docker Monitoring

```bash
docker stats           # Resource usage
docker-compose ps      # Container status
docker-compose logs    # View logs
```

### System Monitoring

```bash
htop                   # CPU/Memory
df -h                  # Disk usage
free -m                # Memory
netstat -tlnp          # Port usage
```

---

## 🆘 Common Issues

### Issue: Port 3000 already in use

**Solution:**

```bash
sudo lsof -i :3000
kill -9 <PID>
```

### Issue: Permission denied

**Solution:**

```bash
sudo chown -R $USER:$USER /home/user/deepphe-deploy
```

### Issue: Cannot connect to application

**Solution:**

```bash
# Check firewall
sudo ufw status
sudo ufw allow 3000/tcp
```

### Issue: Application crashes on startup

**Solution:**

```bash
# Check logs
pm2 logs deepphe-visualizer --err

# Check Node version
node --version  # Should be 18.x+

# Check dependencies
npm install
```

---

## 📚 Documentation Reference

| Document                  | Purpose          | When to Use           |
|---------------------------|------------------|-----------------------|
| DEPLOYMENT_QUICK_START.md | Quick commands   | Day-to-day operations |
| LINUX_DEPLOYMENT.md       | Complete guide   | Full deployment setup |
| DEPLOY_INSTRUCTIONS.txt   | Basic steps      | First-time deployment |
| README.md                 | Project overview | Understanding the app |
| SQLITE_REFACTORING.md     | Database info    | Database-related work |

---

## ✅ Deployment Checklist

**Pre-deployment:**

- [ ] Code committed to Git
- [ ] Tests passing
- [ ] Build succeeds (`npm run build`)
- [ ] Database file ready (`demopatients.sqlite`)
- [ ] Server credentials ready
- [ ] Domain configured (if applicable)

**Deployment:**

- [ ] Files transferred to server
- [ ] Dependencies installed (`npm install`)
- [ ] PM2 installed (`npm install -g pm2`)
- [ ] Application started
- [ ] PM2 configured for startup
- [ ] Firewall configured
- [ ] Application accessible

**Post-deployment:**

- [ ] Health check passing
- [ ] Logs monitoring setup
- [ ] Backup strategy implemented
- [ ] SSL configured (if applicable)
- [ ] Performance tested
- [ ] Documentation updated

---

## 🎉 Success Indicators

Your deployment is successful when:

- ✅ Application loads at http://server-ip:3000
- ✅ `pm2 status` shows "online"
- ✅ No errors in `pm2 logs`
- ✅ Database queries work
- ✅ Application survives server restart

---

## 📞 Next Steps

After successful deployment:

1. Setup monitoring and alerts
2. Configure backups
3. Implement CI/CD pipeline
4. Setup staging environment
5. Document custom configurations
6. Train team on deployment process

---

**All deployment files are ready to use!**

Start with: `./create-deployment-package.sh`

