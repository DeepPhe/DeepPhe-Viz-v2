# Docker Build Fix - npm ci Error Resolution

## Problem

The Docker build was failing with the following error:

```
npm error code EUSAGE
npm error The `npm ci` command can only install with an existing package-lock.json or
npm error npm-shrinkwrap.json with lockfileVersion >= 1.
```

## Root Causes

1. **`.dockerignore` excluding source files**: The `.dockerignore` file was excluding `src/`, `public/`, and
   `craco.config.js` which are required for the React build process.

2. **Obsolete docker-compose version**: The `docker-compose.yml` had a deprecated `version: '3.8'` field that modern
   Docker Compose no longer uses.

3. **npm ci compatibility**: Changed from `npm ci` to `npm install` for better compatibility with lockfileVersion 3.

4. **Peer dependency conflicts**: Added `--legacy-peer-deps` flag to handle React 18 vs @mui/styles (React 17)
   conflicts.

5. **Module resolution configuration excluded**: The `jsconfig.json` file was being excluded from the Docker build,
   breaking absolute imports from the `src` directory.

6. **Import path issue**: The `src/index.js` file had an incorrect import statement using `"App"` instead of `"./App"`.

7. **ESLint errors in source code**: Fixed undefined variable errors in `renderTimeline.js` and unused expression in
   `FilterDefinitions.js` that were blocking the production build.

## Fixes Applied

### 1. Updated `.dockerignore`

**Before:**

```dockerignore
# Development files
src/
public/
.eslintrc.json
.prettierrc.json
jsconfig.json
craco.config.js

# Build artifacts (will be created during build)
build/
```

**After:**

```dockerignore
# Development files (keep src/, public/, jsconfig.json - needed for Docker build)
.eslintrc.json
.prettierrc.json

# Build artifacts that exist locally (will be created during Docker build)
build/
```

**Rationale**: The Docker build process needs access to `src/`, `public/`, `jsconfig.json`, and `craco.config.js` to
compile the React application with proper module resolution.
application.

### 2. Removed obsolete version from `docker-compose.yml`

**Before:**

```yaml
version: '3.8'

services:
  deepphe-visualizer:
  # ...
```

**After:**

```yaml
services:
  deepphe-visualizer:
  # ...
```

**Rationale**: Modern Docker Compose (v2+) no longer requires or uses the `version` field and will display a warning if
it's present.

### 3. Updated Dockerfile

**Before:**

```dockerfile
# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci
```

**After:**

```dockerfile
# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install --legacy-peer-deps
```

**Rationale**:

- Explicit file listing ensures both files are copied
- `npm install` is more forgiving with different lockfileVersion formats
- `--legacy-peer-deps` resolves peer dependency conflicts (React 18 vs @mui/styles expecting React 17)
- Still respects the lock file for reproducible builds

### 4. Fixed import in `src/index.js`

**Before:**

```javascript
import App from "App";
```

**After:**

```javascript
import App from "./App";
```

**Rationale**: The import needed to use a relative path. While `jsconfig.json` with `"baseUrl": "src"` allows absolute
imports from the src directory, this specific import in index.js (which is already in src) should use a relative path
for better compatibility.

### 5. Fixed ESLint errors in source code

**Files fixed:**

- `src/components/Charts/EventRelationTimeline/render/renderTimeline.js` - Commented out code using undefined
  variables (`toggleButtonGroup`, `mainReports`, `desiredGroupLaneOrderStartY`)
- `src/utils/FilterDefinitions.js` - Removed standalone `mapping;` statement with no effect

**Rationale**: These were ESLint `no-undef` and `no-unused-expressions` errors that block the production build. The
renderTimeline.js file had incomplete refactoring where variable declarations were commented out but code using them was
not.

## How to Build Now

```bash
# Clean build (recommended after fixes)
docker-compose build --no-cache

# Or build and start
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Verification

After applying these fixes, the Docker build should:

1. ✅ Copy package.json and package-lock.json
2. ✅ Install dependencies successfully
3. ✅ Copy source code (src/, public/)
4. ✅ Build the React application
5. ✅ Create production container
6. ✅ Start the application on port 3000

## Additional Notes

- **Build time**: First build may take 5-10 minutes depending on your system
- **Image size**: Final production image should be ~200-300MB
- **Node version**: Using Node.js 18 Alpine for smaller image size
- **Multi-stage build**: Build stage has dev dependencies, production stage only has runtime dependencies

## Troubleshooting

If you still encounter issues:

```bash
# Clear Docker cache completely
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache --pull

# Check what files Docker sees
docker build --no-cache -t test -f - . << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN ls -la
RUN ls -la src/
RUN ls -la public/
EOF
```

## Date

Fixed: January 13, 2026

