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

### 🐳 Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

**Your app will be running at:** `http://localhost:3000` (or your server IP:3000)

### 🔧 Manual Docker Commands

```bash
# Build the Docker image
docker build -t deepphe-visualizer .

# Run the container
docker run -d -p 3000:3000 --name deepphe-viz deepphe-visualizer

# View logs
docker logs -f deepphe-viz

# Stop and remove
docker stop deepphe-viz && docker rm deepphe-viz
```

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
└── docker-compose.yml      # Docker Compose setup
```

---

## Database

The application uses SQLite for data storage:

- **File:** `demopatients.sqlite`
- **Location:** `public/` directory
- **Access:** Direct SQL queries via `sql.js`

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

| Command         | Description              |
|-----------------|--------------------------|
| `npm start`     | Start development server |
| `npm run build` | Build for production     |
| `npm test`      | Run tests                |

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

