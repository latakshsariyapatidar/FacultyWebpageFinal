# Docker Setup Guide for Faculty Website

## Project Structure
```
FacultyWebsite/
├── docker-compose.yml          # Main orchestration file
├── nginx/
│   ├── nginx.conf              # Nginx reverse proxy configuration
│   └── ssl/                    # SSL certificates (mount from host)
│       ├── nginx-SSL2025-26.pem
│       └── star_iitdh_key.key
├── frontend/
│   ├── Dockerfile              # Frontend React build
│   ├── Dockerfile.admin        # Admin server
│   ├── package.json
│   ├── admin-server.js
│   ├── admin.html
│   └── src/
├── backend/
│   ├── Dockerfile              # Backend API server
│   ├── package.json
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── data/
│   └── ...
└── .dockerignore
```

## Prerequisites
- Docker Desktop installed (or Docker Engine + Docker Compose)
- SSL certificates placed in `nginx/ssl/` directory
- Both `frontend/` and `backend/` have their own `package.json` and dependencies configured

## Setup Instructions

### 1. Prepare SSL Certificates
Copy your SSL certificates to the nginx directory:
```bash
# From your server
mkdir -p nginx/ssl
cp /etc/nginx/ssl/nginx-SSL2025-26.pem nginx/ssl/
cp /etc/nginx/ssl/star_iitdh_key.key nginx/ssl/
```

### 2. Update Environment Files (If Needed)
Create `.env.docker` in root for production overrides:
```bash
# .env.docker (optional)
NODE_ENV=production
REACT_APP_API_URL=https://faculty.iitdh.ac.in/api
REACT_APP_ADMIN_URL=https://faculty.iitdh.ac.in/admin
```

### 3. Build Docker Images
```bash
docker-compose build
```

### 4. Start All Services
```bash
docker-compose up -d
```

Services will be available at:
- **Main Website**: https://faculty.iitdh.ac.in
- **API**: https://faculty.iitdh.ac.in/api/
- **Admin Panel**: https://faculty.iitdh.ac.in/admin/

### 5. Verify Services
```bash
# Check all containers are running
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service logs
docker-compose logs -f nginx
docker-compose logs -f backend
docker-compose logs -f admin
docker-compose logs -f frontend
```

## Service Details

### Frontend (React SPA)
- **Port**: 3000 (internal)
- **Build**: Automatic React build during container startup
- **Route**: `/` (proxied through nginx)
- **Restart**: Uses `npm start` (ensure configured in package.json)

### Backend (API Server)
- **Port**: 8000
- **Environment**: NODE_ENV=production
- **Route**: `/api/`
- **Volumes**: Mounts `backend/data` for persistent data

### Admin (Admin Server)
- **Port**: 7997
- **Environment**: NODE_ENV=production
- **Route**: `/admin/`
- **Startup**: Runs `node admin-server.js`

### Nginx (Reverse Proxy)
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Routes**:
  - `/` → Frontend container
  - `/api/` → Backend container
  - `/admin/` → Admin container
- **SSL**: Configured with your certificates
- **Features**: Gzip compression, HTTP→HTTPS redirect, CORS headers

## Common Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Rebuild images
```bash
docker-compose build --no-cache
```

### View logs
```bash
docker-compose logs -f              # All services
docker-compose logs -f nginx        # Specific service
```

### Execute commands in container
```bash
docker-compose exec backend npm list
docker-compose exec frontend npm list
```

### Restart a service
```bash
docker-compose restart nginx
docker-compose restart backend
```

### Remove everything (volumes, networks, containers)
```bash
docker-compose down -v
```

## Important Notes

1. **Package.json Scripts**: Ensure your `frontend/package.json` has a `start` script. For React created with CRA:
   ```json
   "scripts": {
     "start": "react-scripts start",
     "build": "react-scripts build"
   }
   ```

2. **Admin Server Configuration**: Update `frontend/admin-server.js` to listen on port 7997:
   ```javascript
   const PORT = process.env.PORT || 7997;
   app.listen(PORT, () => console.log(`Admin server running on port ${PORT}`));
   ```

3. **Backend Server Configuration**: Ensure `backend/server.js` listens on port 8000:
   ```javascript
   const PORT = process.env.PORT || 8000;
   app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
   ```

4. **SSL Certificates**: Certificates are mounted as read-only volumes from host. Keep them in `nginx/ssl/` directory.

5. **CORS**: The nginx configuration includes basic CORS headers for the API. Adjust as needed in your backend.

6. **Data Persistence**: Backend data directory is mounted as a volume. All data in `backend/data/` will persist across container restarts.

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port
# On Linux/Mac
lsof -i :3000
kill -9 <PID>

# Using docker directly
docker-compose down
```

### Containers Not Starting
```bash
# Check logs
docker-compose logs -f

# Rebuild without cache
docker-compose build --no-cache --pull
docker-compose up -d
```

### SSL Certificate Issues
- Verify certificate paths exist: `nginx/ssl/nginx-SSL2025-26.pem` and `nginx/ssl/star_iitdh_key.key`
- Permissions should be readable by nginx user
- Check certificate validity: `openssl x509 -in nginx/ssl/nginx-SSL2025-26.pem -text -noout`

### Frontend Not Building
```bash
# Check if node_modules exists in container
docker-compose exec frontend ls -la node_modules

# Rebuild frontend
docker-compose build --no-cache frontend
```

### API Not Accessible
```bash
# Verify backend is running
docker-compose exec backend curl http://localhost:8000/health

# Check nginx proxy settings
docker-compose logs -f nginx
```

## Production Deployment

When deploying to production:

1. Update `docker-compose.yml`:
   - Add `restart: unless-stopped` to all services (already in nginx)
   - Consider adding healthchecks
   - Use specific version tags instead of `latest`

2. Security:
   - Set strong passwords in environment variables
   - Use `.env` file (don't commit secrets)
   - Restrict volume mounts with `:ro` (read-only) where possible

3. Monitoring:
   - Set up log aggregation
   - Configure health checks
   - Monitor disk space for data volumes

## Additional Resources

- Docker Compose Documentation: https://docs.docker.com/compose/
- Nginx Proxy Documentation: https://docs.docker.com/config/containers/container-networking/
- SSL/TLS Best Practices: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html
