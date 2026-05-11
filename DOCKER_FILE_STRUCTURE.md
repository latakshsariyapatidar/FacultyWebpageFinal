# Docker Configuration File Structure

## Created Files Overview

### Root Directory
```
FacultyWebsite/
├── docker-compose.yml           (Development config - main file to use)
├── docker-compose.prod.yml      (Production config with health checks)
├── .dockerignore                (Optimize build context)
├── .env.example                 (Environment variables template)
├── setup-docker.bat             (Windows quick setup script)
├── setup-docker.sh              (Linux/Mac quick setup script)
└── nginx/
    ├── nginx.conf               (Reverse proxy configuration)
    └── ssl/
        ├── nginx-SSL2025-26.pem (Your SSL certificate - place here)
        └── star_iitdh_key.key   (Your SSL private key - place here)
```

### Frontend Directory
```
frontend/
├── Dockerfile                   (Build React SPA)
└── Dockerfile.admin             (Build admin server)
```

### Backend Directory
```
backend/
└── Dockerfile                   (Build Node.js API)
```

### Documentation
```
FacultyWebsite/
├── README_DOCKER.md             (Start here - Overview & quick start)
├── DOCKER_SETUP.md              (Complete setup guide)
├── DOCKER_QUICK_REFERENCE.md    (Daily commands & troubleshooting)
├── DEPLOYMENT_CHECKLIST.md      (Code changes needed + testing)
└── DOCKER_FILE_STRUCTURE.md     (This file)
```

---

## File Purposes

### Main Docker Compose Files

#### `docker-compose.yml`
- **Purpose**: Development environment
- **When to use**: Local development, testing
- **Features**: 
  - All services with exposed ports
  - Volume mounts for live editing
  - Services restart on failure
- **Command**: `docker-compose up -d`

#### `docker-compose.prod.yml`
- **Purpose**: Production environment
- **When to use**: Deploying to live server
- **Features**:
  - Health checks enabled
  - Proper restart policies
  - Optimized for stability
  - No unnecessary port exposures
- **Command**: `docker-compose -f docker-compose.prod.yml up -d`

---

### Dockerfiles

#### `frontend/Dockerfile`
- **Builds**: React SPA for production
- **Two stages**:
  1. Builder stage: Compiles React app
  2. Production stage: Serves built app
- **Startup**: `npm start`
- **Exposed port**: 3000

#### `frontend/Dockerfile.admin`
- **Builds**: Admin server from Node.js
- **Serves**: admin.html via admin-server.js
- **Startup**: `node admin-server.js`
- **Exposed port**: 7997

#### `backend/Dockerfile`
- **Builds**: Node.js API server
- **Copies**: All backend code
- **Startup**: `node server.js`
- **Exposed port**: 8000

---

### Configuration Files

#### `nginx/nginx.conf`
- **Purpose**: Reverse proxy configuration
- **Routes**:
  - `/` → Frontend (port 3000)
  - `/api/` → Backend (port 8000)
  - `/admin/` → Admin (port 7997)
- **Features**:
  - SSL/TLS termination
  - HTTP → HTTPS redirect
  - Gzip compression
  - CORS headers
  - SPA routing fallback

#### `.env.example`
- **Purpose**: Template for environment variables
- **Copy to**: `.env` for production use
- **Contains**: Database, API, and server configurations
- **Security**: Add `.env` to `.gitignore`

#### `.dockerignore`
- **Purpose**: Exclude unnecessary files from Docker build
- **Ignores**: node_modules, .git, .env, build artifacts
- **Benefit**: Reduces image size, faster builds

---

### Setup Scripts

#### `setup-docker.bat` (Windows)
```batch
Steps:
1. Checks Docker installation
2. Creates required directories
3. Verifies SSL certificates
4. Prompts to build images
5. Prompts to start services
6. Displays access information
```

#### `setup-docker.sh` (Linux/Mac)
```bash
Steps:
1. Checks Docker installation
2. Creates required directories
3. Verifies SSL certificates
4. Prompts to build images
5. Prompts to start services
6. Displays access information
```

---

### Documentation Files

#### `README_DOCKER.md`
- **Start here** for overview
- Architecture diagram
- Quick start commands
- Service descriptions
- Common commands
- Next steps

#### `DOCKER_SETUP.md`
- Detailed setup instructions
- Service configuration details
- Common Docker commands
- Troubleshooting guide
- Production deployment tips

#### `DOCKER_QUICK_REFERENCE.md`
- Daily use commands
- Essential Docker operations
- Debugging techniques
- Common problems & solutions
- File locations in containers

#### `DEPLOYMENT_CHECKLIST.md`
- Required code changes
- Configuration examples
- Pre-deployment checklist
- Testing procedures
- Deployment steps

---

## Usage Flow

### Initial Setup
```
1. Read README_DOCKER.md
2. Review DEPLOYMENT_CHECKLIST.md
3. Make code changes to frontend/backend
4. Run setup-docker.bat (Windows) or setup-docker.sh (Linux/Mac)
5. Verify with: docker-compose ps
```

### Daily Development
```
1. Start: docker-compose up -d
2. Edit code (volume mounts enable live updates)
3. View logs: docker-compose logs -f
4. Stop: docker-compose down
```

### Troubleshooting
```
1. Check DOCKER_QUICK_REFERENCE.md
2. View logs: docker-compose logs -f <service>
3. Execute commands: docker-compose exec <service> <command>
```

### Production Deployment
```
1. Review DEPLOYMENT_CHECKLIST.md (code requirements)
2. Copy SSL certificates to nginx/ssl/
3. Update .env for production
4. Use docker-compose.prod.yml: docker-compose -f docker-compose.prod.yml up -d
5. Monitor: docker-compose logs -f
```

---

## SSL Certificate Placement

Place your certificates in the `nginx/ssl/` directory:

```
nginx/ssl/
├── nginx-SSL2025-26.pem      ← Your SSL certificate
└── star_iitdh_key.key        ← Your SSL private key
```

These are mounted as read-only volumes by nginx and used for HTTPS/SSL termination.

---

## Environment Variables

### Frontend (.env or docker-compose.yml)
```
REACT_APP_API_URL=https://faculty.iitdh.ac.in/api
REACT_APP_ADMIN_URL=https://faculty.iitdh.ac.in/admin
```

### Backend
```
NODE_ENV=production
PORT=8000
CORS_ORIGIN=https://faculty.iitdh.ac.in
```

### Admin
```
NODE_ENV=production
PORT=7997
```

---

## Volumes & Data Persistence

### Frontend
- No persistent volumes (stateless)
- Code volume for development only

### Backend
- `backend/data/` → `/app/data` (persistent)
- Survives container restarts
- Automatically created by Docker

### Nginx
- SSL certificates mounted read-only
- No persistent data

---

## Network Architecture

```
External Request (HTTPS:443)
        ↓
Nginx Container
        ↓
    ┌───┴───────┬─────────┬─────────┐
    ↓           ↓         ↓         ↓
  / route    /api/      /admin/    /health
   (3000)     (8000)    (7997)
    ↓           ↓         ↓
 Frontend    Backend    Admin
Container   Container  Container
```

All services communicate via Docker network names:
- Frontend: `frontend:3000`
- Backend: `backend:8000`
- Admin: `admin:7997`

---

## Docker Commands Cheat Sheet

### Start/Stop
```bash
docker-compose up -d                  # Start
docker-compose down                   # Stop
docker-compose restart                # Restart all
docker-compose restart nginx          # Restart one
```

### Monitoring
```bash
docker-compose ps                     # Status
docker-compose logs -f                # Live logs
docker-compose logs -f nginx          # Specific service
docker stats                          # Resource usage
```

### Building
```bash
docker-compose build                  # Build all
docker-compose build --no-cache       # Rebuild
docker-compose build backend          # Specific service
```

### Debugging
```bash
docker-compose exec backend sh        # Shell access
docker-compose exec backend npm list  # Run command
docker-compose config                 # View config
```

See DOCKER_QUICK_REFERENCE.md for complete list.

---

## Security Considerations

1. **Never commit secrets**
   - Add `.env` to `.gitignore`
   - Use environment variables instead

2. **SSL/TLS**
   - Configured in nginx
   - HTTP automatically redirects to HTTPS

3. **CORS**
   - Configured for your specific domain
   - Prevents unauthorized cross-origin requests

4. **Read-only mounts**
   - Production uses `:ro` for volume mounts
   - Prevents accidental modification

5. **Network isolation**
   - Services only accessible via nginx proxy
   - Internal communication via Docker network

---

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Port conflicts | `docker-compose down` |
| Services won't start | Check `docker-compose logs` |
| SSL errors | Verify certs in `nginx/ssl/` |
| Backend not responding | Check `docker-compose ps backend` |
| Build fails | Try `docker-compose build --no-cache` |
| Volume issues | Verify `backend/data/` exists |

See DOCKER_QUICK_REFERENCE.md for detailed troubleshooting.

---

## Next Steps

1. ✅ All Docker files created
2. ⏳ Update your code (see DEPLOYMENT_CHECKLIST.md)
3. ⏳ Place SSL certificates in nginx/ssl/
4. ⏳ Run setup script
5. ⏳ Deploy to production

---

**For detailed information about any file, see the corresponding documentation file included in this setup.**
