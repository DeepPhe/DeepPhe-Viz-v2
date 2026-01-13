# Quick Deployment Reference

## 🚀 Fastest Way to Deploy

### Option 1: Automated Script (Recommended)

```bash
# On your Mac
cd /Volumes/Samsung-Ext/dev/Viz2
./create-deployment-package.sh

# Transfer to Linux server
scp deepphe-deploy.tar.gz user@your-server:/home/user/

# On Linux server
ssh user@your-server
tar -xzf deepphe-deploy.tar.gz
cd deepphe-deploy
npm install
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Done! Your app is running at http://your-server-ip:3000**

---

### Option 2: Docker (3 Commands)

```bash
# On your Mac or Linux server
cd /Volumes/Samsung-Ext/dev/Viz2

# Build and run (first time may take a few minutes to build)
docker-compose up -d --build

# Check status
docker-compose logs -f
```

**Done! Your app is running at http://your-server-ip:3000**

---

## 📋 Prerequisites Checklist

On your Linux server, install:

```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# OR for Docker approach:
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
```

---

## 🎯 Deployment Methods Comparison

| Method       | Setup Time | Best For   | Difficulty |
|--------------|------------|------------|------------|
| Script + PM2 | 5 min      | Production | Easy       |
| Docker       | 3 min      | Any        | Very Easy  |
| Manual       | 10 min     | Learning   | Medium     |

---

## 📦 What Gets Deployed

```
deepphe-deploy/
├── build/                    # Compiled React app
├── server.js                 # Express server
├── package.json              # Production dependencies only
├── ecosystem.config.js       # PM2 config
├── demopatients.sqlite       # Database
└── DEPLOY_INSTRUCTIONS.txt   # Help file
```

**Total size: ~50-100MB** (depending on your build)

---

## 🔧 Common Tasks

### Start/Stop/Restart

**With PM2:**

```bash
pm2 start deepphe-visualizer
pm2 stop deepphe-visualizer
pm2 restart deepphe-visualizer
pm2 delete deepphe-visualizer
```

**With Docker:**

```bash
docker-compose up -d
docker-compose stop
docker-compose restart
docker-compose down
```

### View Logs

**With PM2:**

```bash
pm2 logs deepphe-visualizer
pm2 logs deepphe-visualizer --lines 100
```

**With Docker:**

```bash
docker-compose logs -f
docker-compose logs --tail=100
```

### Update Application

**With PM2:**

```bash
# Build new version on Mac
npm run build

# Transfer to server
scp -r build/ user@server:/home/user/deepphe-deploy/

# Restart
pm2 restart deepphe-visualizer
```

**With Docker:**

```bash
# Rebuild and restart
docker-compose up -d --build
```

---

## 🌐 Access Your Application

**Direct access:**

```
http://your-server-ip:3000
```

**With domain (after nginx setup):**

```
http://your-domain.com
https://your-domain.com  (with SSL)
```

---

## ⚠️ Troubleshooting

**Port already in use:**

```bash
# Find what's using port 3000
sudo lsof -i :3000
# Kill the process
kill -9 <PID>
```

**Out of memory:**

```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
pm2 restart deepphe-visualizer
```

**Can't connect:**

```bash
# Check firewall
sudo ufw allow 3000/tcp
# Or
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
```

**Application crashes:**

```bash
# Check logs
pm2 logs deepphe-visualizer --err
# Check system resources
htop
free -m
df -h
```

---

## 📚 Full Documentation

- **Complete Guide:** [LINUX_DEPLOYMENT.md](./LINUX_DEPLOYMENT.md)
- **Project Docs:** [README.md](./README.md)
- **SQLite Refactor:** [SQLITE_REFACTORING.md](./SQLITE_REFACTORING.md)

---

## 🆘 Quick Help

**Check if running:**

```bash
pm2 status
# or
docker-compose ps
# or
curl http://localhost:3000
```

**Restart everything:**

```bash
pm2 restart all
# or
docker-compose restart
```

**Clean slate:**

```bash
pm2 delete all
pm2 save
# or
docker-compose down -v
```

---

## ✅ Production Checklist

Before going live:

- [ ] Application builds successfully (`npm run build`)
- [ ] PM2 or Docker configured
- [ ] Firewall rules configured (ports 80, 443, 3000)
- [ ] Nginx reverse proxy setup (optional but recommended)
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] PM2 startup script enabled (`pm2 startup`)
- [ ] Logs directory created and monitored
- [ ] Backup script configured for database
- [ ] Health monitoring setup
- [ ] Domain DNS configured (if using domain)

---

## 📞 Support

For issues:

1. Check logs first: `pm2 logs` or `docker-compose logs`
2. Review [LINUX_DEPLOYMENT.md](./LINUX_DEPLOYMENT.md)
3. Check application status: `pm2 status` or `docker-compose ps`
4. Verify Node.js version: `node --version` (should be 18.x+)

---

**Happy Deploying! 🎉**

