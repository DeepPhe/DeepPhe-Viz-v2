# DeepPhe-Viz-v2

A visualization platform for DeepPhe cancer phenotype data.

## Project Overview

DeepPhe-Viz is a web-based application designed to visualize and interact with cancer phenotype data processed by the
DeepPhe system. It provides researchers and clinicians with an intuitive interface to explore complex datasets,
facilitating better understanding and analysis of cancer phenotypes.

## Features

- 📊 Interactive data visualization
- 🔍 Advanced filtering and search
- 💾 Direct SQLite database access (no IndexedDB)
- 🚀 Optimized performance with caching
- 📱 Responsive design
- 🔒 Secure deployment options

---

## Development

### Prerequisites

- Node.js (v18.x or higher)
- npm (v8.x or higher)
- Modern web browser (Chrome, Firefox, Edge recommended)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/DeepPhe/DeepPhe-Viz-v2.git
cd DeepPhe-Viz-v2
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Visit http://localhost:3000/ to see the visualization.

5. To stop the server, press `Ctrl + C` in the terminal.

---

## Production Deployment

### 🚀 Quick Deploy to Linux

**Fastest method using automated script:**

```bash
# 1. Create deployment package
./create-deployment-package.sh

# 2. Transfer to Linux server
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

**Your app is now running at:** `http://your-server-ip:3000`

### 🐳 Docker Deployment

```bash
# Build and run with Docker
docker-compose up -d

# View logs
docker-compose logs -f
```

### 📚 Complete Deployment Documentation

- **[Quick Start Guide](DEPLOYMENT_QUICK_START.md)** - Common commands and quick reference
- **[Complete Linux Deployment](LINUX_DEPLOYMENT.md)** - Full deployment guide with all methods
- **[Deployment Files Summary](DEPLOYMENT_FILES_SUMMARY.md)** - Overview of all deployment files

---

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

---

## Project Structure

```
Viz2/
├── public/                 # Static files
│   └── demopatients.sqlite # SQLite database
├── src/
│   ├── components/         # React components
│   ├── utils/
│   │   └── db/
│   │       └── sqlite_client.js  # SQLite database client
│   └── App.js
├── build/                  # Production build (generated)
├── server.js               # Express server
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose setup
└── create-deployment-package.sh  # Deployment automation
```

---

## Database

The application uses SQLite for data storage:

- **File:** `demopatients.sqlite`
- **Location:** `public/` directory
- **Access:** Direct SQL queries via `sql.js`
- **Documentation:** [SQLite Refactoring Guide](SQLITE_REFACTORING.md)

---

## Testing

```bash
# Run unit tests
npm test

# Run SQLite client tests
npm test -- sqlite_client.test.js
```

---

## Scripts

| Command                          | Description               |
|----------------------------------|---------------------------|
| `npm start`                      | Start development server  |
| `npm run build`                  | Build for production      |
| `npm test`                       | Run tests                 |
| `./create-deployment-package.sh` | Create deployment package |

---

## Environment Variables

Create a `.env` file for custom configuration:

```bash
PORT=3000
NODE_ENV=production
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## License

See LICENSE file for details.

---

## Support

For deployment help, see:

- [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md)
- [LINUX_DEPLOYMENT.md](LINUX_DEPLOYMENT.md)

For development help, see:

- [SQLITE_REFACTORING.md](SQLITE_REFACTORING.md)
- [SQLITE_CLIENT_QUICK_REF.md](SQLITE_CLIENT_QUICK_REF.md)

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

---

## Authors

University of Pittsburgh, Department of Biomedical Informatics

---

## Version

**v2.1.0** - SQLite Direct Access with Enhanced Deployment
