# Docker Quick Reference Guide

## Quick Start

### First Time Setup (Windows)
```bash
setup-docker.bat
```

### First Time Setup (Linux/Mac)
```bash
chmod +x setup-docker.sh
./setup-docker.sh
```

### Manual Start
```bash
docker-compose up -d
```

---

## Essential Commands

### View Status
```bash
# Check all running containers
docker-compose ps

# View container logs (real-time)
docker-compose logs -f

# View specific service logs
docker-compose logs -f nginx      # Nginx reverse proxy
docker-compose logs -f backend    # API server
docker-compose logs -f admin      # Admin panel
docker-compose logs -f frontend   # React app
```

### Start/Stop/Restart
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop services and remove volumes
docker-compose down -v

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart nginx
docker-compose restart backend
docker-compose restart admin
docker-compose restart frontend
```

### Build & Deployment
```bash
# Build/rebuild all images
docker-compose build

# Build without cache
docker-compose build --no-cache

# Build specific service
docker-compose build backend

# Pull latest base images
docker-compose build --pull
```

### Execute Commands
```bash
# Run command in container
docker-compose exec backend npm list
docker-compose exec frontend npm list

# Open shell in container
docker-compose exec backend sh
docker-compose exec frontend sh

# View container files
docker-compose exec backend ls -la
docker-compose exec backend ls -la data/
```

### Debugging
```bash
# Check container details
docker-compose ps -a

# Inspect service configuration
docker-compose config

# Validate docker-compose.yml
docker-compose config --quiet

# Check specific container logs
docker logs <container-id>

# Get container IP
docker-compose exec nginx hostname -I

# Test connectivity between containers
docker-compose exec frontend ping backend
docker-compose exec admin ping backend
```

---

## Useful Docker Commands

### Image Management
```bash
# List local images
docker images

# Remove unused images
docker image prune

# Remove specific image
docker rmi <image-name>
```

### Volume Management
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect <volume-name>

# Remove unused volumes
docker volume prune
```

### Network Management
```bash
# List networks
docker network ls

# Inspect network
docker network inspect faculty-network
```

---

## Production vs Development

### Development (docker-compose.yml)
- Services restart on failure
- Volumes for live code editing
- Detailed logging
- Use: `docker-compose up -d`

### Production (docker-compose.prod.yml)
- Enhanced restart policies
- Health checks configured
- Optimized for stability
- Use: `docker-compose -f docker-compose.prod.yml up -d`

---

## Common Troubleshooting

### Services won't start
```bash
# Check logs for errors
docker-compose logs

# Rebuild without cache
docker-compose build --no-cache

# Restart Docker daemon
# Windows: Restart Docker Desktop
# Linux: sudo systemctl restart docker
```

### Port conflicts
```bash
# Find process using port
# Windows: netstat -ano | findstr :3000
# Linux: lsof -i :3000

# Stop conflicting container
docker-compose down

# Or change ports in docker-compose.yml
```

### SSL/Certificate issues
```bash
# Verify certificate exists
ls -la nginx/ssl/

# Test certificate validity
openssl x509 -in nginx/ssl/nginx-SSL2025-26.pem -text -noout

# Verify key and cert match
openssl x509 -noout -modulus -in nginx/ssl/nginx-SSL2025-26.pem | openssl md5
openssl rsa -noout -modulus -in nginx/ssl/star_iitdh_key.key | openssl md5
```

### Container crashes on startup
```bash
# Check logs
docker-compose logs -f <service>

# Verify environment variables
docker-compose config | grep environment

# Check if ports are available
netstat -tlnp | grep 3000   # Frontend
netstat -tlnp | grep 8000   # Backend
netstat -tlnp | grep 7997   # Admin
netstat -tlnp | grep 443    # Nginx
```

### Data persistence issues
```bash
# Check if data volume is mounted
docker-compose exec backend mount | grep data

# Verify backend/data directory exists and has correct permissions
ls -la backend/data

# Check data in container
docker-compose exec backend ls -la /app/data
```

---

## Monitoring & Maintenance

### Check system resources
```bash
# Container resource usage
docker stats

# Or specific container
docker stats faculty-backend
```

### Cleanup & Optimization
```bash
# Remove unused containers
docker container prune

# Remove unused networks
docker network prune

# Remove unused images
docker image prune

# Full cleanup (careful!)
docker system prune -a
```

### Backup data
```bash
# Backup backend data
docker-compose exec backend tar czf - /app/data > backup.tar.gz

# Restore from backup
tar xzf backup.tar.gz -C backend/
```

---

## File Locations in Containers

### Frontend
- App: `/app`
- Build: `/app/build`
- Node modules: `/app/node_modules`

### Backend
- App: `/app`
- Data: `/app/data`
- Config: `/app/config`
- Node modules: `/app/node_modules`

### Admin
- App: `/app`
- Admin server: `/app/admin-server.js`

### Nginx
- Config: `/etc/nginx/nginx.conf`
- SSL: `/etc/nginx/ssl/`
- Logs: `/var/log/nginx/`

---

## Environment Variables

### Frontend
- `REACT_APP_API_URL`: API endpoint URL
- `REACT_APP_ADMIN_URL`: Admin panel URL

### Backend
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 8000)

### Admin
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 7997)

---

## Useful Resources

- Docker Documentation: https://docs.docker.com/
- Docker Compose Reference: https://docs.docker.com/compose/compose-file/
- Nginx Documentation: https://nginx.org/en/docs/
- React in Docker: https://create-react-app.dev/docs/deployment/#docker
- Node.js Docker Best Practices: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
