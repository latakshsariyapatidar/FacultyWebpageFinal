# Docker & Docker Compose Complete Setup - Summary

## 📋 What You Have

I've created a complete Docker setup for your Faculty Website project with:

### Files Created

```
FacultyWebsite/
├── docker-compose.yml              ✓ Main development configuration
├── docker-compose.prod.yml         ✓ Production configuration with health checks
├── .dockerignore                   ✓ Optimize Docker build context
├── .env.example                    ✓ Environment variables template
│
├── frontend/
│   ├── Dockerfile                  ✓ Build React SPA
│   └── Dockerfile.admin            ✓ Build admin server
│
├── backend/
│   └── Dockerfile                  ✓ Build Node.js API server
│
├── nginx/
│   ├── nginx.conf                  ✓ Reverse proxy configuration
│   └── ssl/                        ✓ Place SSL certificates here
│       ├── nginx-SSL2025-26.pem
│       └── star_iitdh_key.key
│
├── setup-docker.sh                 ✓ Linux/Mac automated setup
├── setup-docker.bat                ✓ Windows automated setup
│
├── DOCKER_SETUP.md                 ✓ Detailed setup documentation
├── DOCKER_QUICK_REFERENCE.md       ✓ Common commands and troubleshooting
├── DEPLOYMENT_CHECKLIST.md         ✓ Pre-deployment requirements
└── README_DOCKER.md                ✓ This file
```

---

## 🚀 Quick Start

### For Windows Users
```bash
# Run the setup script
setup-docker.bat
```

### For Linux/Mac Users
```bash
# Make script executable
chmod +x setup-docker.sh

# Run the setup script
./setup-docker.sh
```

### Manual Setup (All Platforms)
```bash
# 1. Copy SSL certificates
mkdir -p nginx/ssl
# Copy your certificates to nginx/ssl/

# 2. Build images
docker-compose build

# 3. Start services
docker-compose up -d

# 4. Verify
docker-compose ps
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Internet                      │
│                (HTTPS: 443)                     │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              Nginx Reverse Proxy                │
│          (Port 80 → 443 redirect)              │
├─────────────────────────────────────────────────┤
│ Routes:                                         │
│  / ────────────────► React Frontend (3000)     │
│  /api/ ────────────► Node.js API (8000)        │
│  /admin/ ──────────► Admin Server (7997)       │
└─────────────────────────────────────────────────┘
```

---

## 📦 Services

### 1. **Frontend** (React SPA)
- **Port**: 3000 (internal)
- **Route**: `/`
- **Environment**: REACT_APP_API_URL, REACT_APP_ADMIN_URL
- **Startup**: `npm start` (runs development or production build)
- **Volume**: `src/` (for development live reload)

### 2. **Backend** (Node.js API)
- **Port**: 8000
- **Route**: `/api/`
- **Environment**: NODE_ENV, PORT
- **Startup**: `node server.js`
- **Volume**: `backend/data/` (persistent storage)

### 3. **Admin** (Admin Dashboard)
- **Port**: 7997
- **Route**: `/admin/`
- **Environment**: NODE_ENV, PORT
- **Startup**: `node admin-server.js`
- **Served by**: admin-server.js and admin.html

### 4. **Nginx** (Reverse Proxy)
- **Ports**: 80, 443
- **SSL**: Configured with your certificates
- **Features**: 
  - HTTP → HTTPS redirect
  - Gzip compression
  - CORS headers for API
  - SPA routing for frontend

---

## 📝 Key Configuration Files

### docker-compose.yml (Development)
- All services with accessible ports
- Volume mounts for development
- Networking configured
- Auto-restart disabled

### docker-compose.prod.yml (Production)
- No exposed service ports (only nginx)
- Read-only volume mounts
- Health checks enabled
- Auto-restart on failure

### nginx/nginx.conf
- Three location blocks: /, /api/, /admin/
- SSL/TLS configuration
- Gzip compression
- CORS headers
- SPA routing with fallback to /index.html

---

## ✅ Pre-Deployment Requirements

### 1. Code Changes Needed
Your code needs a few updates to work properly in Docker:

**Frontend** (`frontend/package.json`):
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

**Frontend** (Use environment variables):
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

**Backend** (`backend/server.js`):
```javascript
const PORT = process.env.PORT || 8000;
const HOST = '0.0.0.0'; // Important for Docker
app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Admin** (`frontend/admin-server.js`):
```javascript
const PORT = process.env.PORT || 7997;
const HOST = '0.0.0.0'; // Important for Docker
app.listen(PORT, HOST, () => {
  console.log(`Admin running on port ${PORT}`);
});
```

See `DEPLOYMENT_CHECKLIST.md` for complete requirements.

### 2. SSL Certificates
Place your certificates in `nginx/ssl/`:
- `nginx-SSL2025-26.pem` (certificate)
- `star_iitdh_key.key` (private key)

Without these, nginx will fail to start.

### 3. Data Directory
Ensure `backend/data/` directory exists:
```bash
mkdir -p backend/data
```

---

## 🔧 Common Commands

### Start/Stop
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose restart            # Restart all services
docker-compose restart nginx      # Restart specific service
```

### Monitoring
```bash
docker-compose ps                 # View service status
docker-compose logs -f            # View all logs (real-time)
docker-compose logs -f nginx      # View specific service logs
docker stats                      # View resource usage
```

### Building
```bash
docker-compose build              # Build all images
docker-compose build --no-cache   # Build without cache
docker-compose build backend      # Build specific service
```

### Development
```bash
docker-compose exec frontend npm list    # Check dependencies
docker-compose exec backend npm list
docker-compose exec backend npm install  # Install packages
docker-compose exec frontend sh          # Open shell in container
```

See `DOCKER_QUICK_REFERENCE.md` for more commands.

---

## 📊 Network Communication

Inside Docker:
- Frontend talks to backend at: `http://backend:8000`
- Nginx proxies to: `http://frontend:3000`, `http://backend:8000`, `http://admin:7997`
- All services on same network: `faculty-network`

For external calls (from frontend JavaScript):
- Production: `https://faculty.iitdh.ac.in/api`
- Development: `http://localhost:8000/api`

---

## 🐛 Troubleshooting

### Services won't start
```bash
docker-compose logs -f
# Check for specific error messages
```

### Port conflicts
```bash
# Stop conflicting container
docker-compose down

# Or change ports in docker-compose.yml
```

### SSL errors
```bash
# Verify certificates exist
ls -la nginx/ssl/

# Check certificate validity
openssl x509 -in nginx/ssl/nginx-SSL2025-26.pem -text -noout
```

### Backend can't be reached
```bash
# Verify backend is running
docker-compose ps backend

# Check logs
docker-compose logs backend

# Test connectivity
docker-compose exec frontend curl http://backend:8000/health
```

See `DOCKER_QUICK_REFERENCE.md` for more troubleshooting.

---

## 📚 Documentation Files

1. **DOCKER_SETUP.md**
   - Detailed setup instructions
   - Service descriptions
   - Production deployment guide
   - Troubleshooting guide

2. **DOCKER_QUICK_REFERENCE.md**
   - Quick commands for daily use
   - Common troubleshooting
   - File locations in containers
   - Backup and restore procedures

3. **DEPLOYMENT_CHECKLIST.md**
   - Code changes required
   - Pre-deployment checklist
   - Configuration examples
   - Testing procedures

4. **.env.example**
   - Environment variables template
   - Copy to `.env` for production

---

## 🔐 Security Notes

1. **Never commit `.env`** - Add to `.gitignore`
2. **SSL certificates** - Keep in `nginx/ssl/`, not in repo
3. **Secrets** - Use environment variables or Docker secrets
4. **CORS** - Configured for your domain in nginx.conf
5. **Passwords/Keys** - Store in `.env` file (not in code)

---

## 📈 Performance Tips

1. **Multi-stage builds** - Already implemented in Dockerfiles
2. **Alpine images** - Nginx uses `nginx:alpine` for smaller size
3. **Volume optimization** - Backend data persists across restarts
4. **Gzip compression** - Enabled for all responses
5. **Health checks** - Configured for auto-recovery

---

## 🚢 Deployment Steps

### On Development Machine
```bash
# 1. Make code changes per DEPLOYMENT_CHECKLIST.md
# 2. Test locally
docker-compose up -d
# 3. Verify at http://localhost
```

### On Production Server
```bash
# 1. Upload files
scp -r FacultyWebsite/ user@faculty.iitdh.ac.in:/home/adminuser/

# 2. Upload SSL certificates
scp /path/to/certs/* user@faculty.iitdh.ac.in:/home/adminuser/FacultyWebsite/nginx/ssl/

# 3. SSH into server
ssh user@faculty.iitdh.ac.in

# 4. Navigate to project
cd /home/adminuser/FacultyWebsite

# 5. Build and start
docker-compose build
docker-compose up -d

# 6. Verify
docker-compose ps
```

---

## 📞 Support & Resources

- **Docker**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Nginx**: https://nginx.org/en/docs/
- **Node.js**: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
- **React**: https://create-react-app.dev/docs/deployment/

---

## ✨ What's Next?

1. **Read** `DEPLOYMENT_CHECKLIST.md` - Understand what code changes are needed
2. **Review** `DOCKER_SETUP.md` - Complete setup guide
3. **Update your code** - Follow the checklist requirements
4. **Test locally** - Run `setup-docker.bat` or `setup-docker.sh`
5. **Deploy to production** - Follow deployment steps above

---

## 📝 Notes

- All services communicate via Docker network - no port forwarding needed for internal communication
- SSL certificates are mounted at runtime - can be updated without rebuilding
- Data persists in `backend/data/` volume across container restarts
- Frontend build happens during container startup
- Health checks ensure services recover automatically from failures

---

**Happy Deploying! 🚀**

For detailed information, see the individual documentation files included in this folder.
