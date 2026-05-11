# Pre-Docker Deployment Checklist

## Required Modifications to Your Code

### 1. Frontend (React App)

#### package.json
Ensure `package.json` has proper start and build scripts:
```json
{
  "name": "faculty-frontend",
  "version": "1.0.0",
  "private": true,
  "homepage": "/",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-scripts": "5.0.0"
  }
}
```

#### Environment Configuration
Update `src/config/env.js` to use environment variables:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const ADMIN_URL = process.env.REACT_APP_ADMIN_URL || 'http://localhost:7997';

export default {
  API_URL,
  ADMIN_URL
};
```

#### API Calls
Ensure all API calls use the environment variable:
```javascript
// Before
const response = await fetch('http://localhost:8000/api/faculty');

// After
const response = await fetch(`${process.env.REACT_APP_API_URL}/faculty`);
```

---

### 2. Backend (Node.js Server)

#### server.js Configuration
Ensure your `server.js` is configured for Docker:
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api', require('./routes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(require('./middleware/errorHandler'));

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
```

#### package.json
Ensure your backend `package.json` is properly configured:
```json
{
  "name": "faculty-backend",
  "version": "1.0.0",
  "description": "Faculty Website API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}
```

#### Environment Variables
Use `.env` or Docker environment variables:
```javascript
require('dotenv').config();

const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

module.exports = config;
```

---

### 3. Admin Server (frontend/admin-server.js)

#### Configuration
Update `admin-server.js` to listen on port 7997:
```javascript
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 7997;
const HOST = process.env.HOST || '0.0.0.0';

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve admin.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, HOST, () => {
  console.log(`Admin server running on http://${HOST}:${PORT}`);
});
```

---

### 4. Update Frontend Build

#### Update admin-server.js references
In `frontend/admin-server.js`, ensure paths are correct:
```javascript
// Use relative paths that work in Docker
const adminHtmlPath = path.join(__dirname, 'admin.html');
const publicDir = path.join(__dirname, 'public');

app.use(express.static(publicDir));
```

---

## Pre-Deployment Checklist

### Code Changes
- [ ] Frontend uses environment variables for API URLs
- [ ] Backend server.js listens on `0.0.0.0` and correct port
- [ ] Admin server.js listens on port 7997
- [ ] All API endpoints have CORS configured
- [ ] Health check endpoints are available at `/health`
- [ ] Error handling middleware is in place
- [ ] No hardcoded localhost URLs in code

### Configuration Files
- [ ] Both `frontend/package.json` and `backend/package.json` exist
- [ ] `frontend/package.json` has `start` and `build` scripts
- [ ] `backend/package.json` has `start` script
- [ ] Environment variables are documented in `.env.example`
- [ ] No `.env` file is committed to git

### Docker Files
- [ ] `docker-compose.yml` is present in root
- [ ] All Dockerfiles exist:
  - [ ] `frontend/Dockerfile`
  - [ ] `frontend/Dockerfile.admin`
  - [ ] `backend/Dockerfile`
- [ ] `nginx/nginx.conf` is configured correctly
- [ ] `.dockerignore` is present

### Certificates & Secrets
- [ ] SSL certificates exist in `nginx/ssl/`
  - [ ] `nginx-SSL2025-26.pem`
  - [ ] `star_iitdh_key.key`
- [ ] Certificates are readable
- [ ] Secrets are NOT in docker-compose.yml or Dockerfile
- [ ] Use environment variables or secrets management

### Data & Volumes
- [ ] `backend/data/` directory exists or is created automatically
- [ ] Data directory has proper permissions
- [ ] Volume mounts are correctly configured
- [ ] Data backup strategy is in place

### Testing
- [ ] All services start without errors: `docker-compose up -d`
- [ ] All services are healthy: `docker-compose ps`
- [ ] Frontend loads at http://localhost/
- [ ] API responds at http://localhost/api/
- [ ] Admin panel loads at http://localhost/admin/
- [ ] Logs are clean: `docker-compose logs`

### Production Readiness
- [ ] Environment variables are set for production
- [ ] SSL certificates are installed and valid
- [ ] CORS is configured for specific domain
- [ ] Database/data persistence is verified
- [ ] Backup plan is documented
- [ ] Monitoring and logging are configured
- [ ] Health checks are returning proper status

---

## Important Notes

### 1. Docker Networking
- Services communicate via container names:
  - `frontend:3000`
  - `backend:8000`
  - `admin:7997`
- External traffic goes through nginx on ports 80/443

### 2. File Paths in Docker
Always use absolute paths from the working directory:
```javascript
// Inside container, not host paths
app.use(express.static('/app/build'));
```

### 3. Environment Variables
Must be set in:
- `docker-compose.yml` (for development)
- `.env` file (for production with `docker-compose --env-file`)
- Docker secrets (for sensitive data)

### 4. Logging
- Logs go to stdout/stderr (visible via `docker-compose logs`)
- No need to write to files unless required
- Use structured logging (JSON) for production

### 5. Resource Limits
Consider adding resource limits to `docker-compose.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

---

## Deployment Steps

1. **Prepare Code**
   - Follow checklist items above
   - Test locally first

2. **Copy to Production Server**
   ```bash
   scp -r FacultyWebsite/ user@faculty.iitdh.ac.in:/home/adminuser/
   ```

3. **Copy SSL Certificates**
   ```bash
   scp /etc/nginx/ssl/* user@faculty.iitdh.ac.in:/home/adminuser/FacultyWebsite/nginx/ssl/
   ```

4. **Build and Start**
   ```bash
   cd /home/adminuser/FacultyWebsite
   docker-compose build
   docker-compose up -d
   ```

5. **Verify**
   ```bash
   docker-compose ps
   docker-compose logs
   ```

---

## Troubleshooting During Setup

### Build Fails
```bash
# Check logs
docker-compose logs -f

# Rebuild without cache
docker-compose build --no-cache

# Check specific service
docker-compose build --no-cache backend
```

### Services Won't Start
- Check if ports are available
- Verify environment variables are correct
- Check logs for specific errors
- Ensure data directories exist with correct permissions

### Connection Issues Between Services
- Use service names (not localhost) for internal communication
- Verify containers are on the same network
- Check nginx.conf proxy_pass settings
- Test connectivity: `docker-compose exec backend ping frontend`

---

## Support Resources

- Docker Documentation: https://docs.docker.com/
- Docker Compose File Reference: https://docs.docker.com/compose/compose-file/compose-file-v3/
- Nginx Documentation: https://nginx.org/en/docs/
- Node.js Docker Guide: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
- React Docker Guide: https://create-react-app.dev/docs/deployment/
