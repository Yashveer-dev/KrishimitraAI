# KrishimitraAI Docker Deployment Guide

## 🚀 Complete Docker Deployment for Beginners

This guide will help you deploy the KrishimitraAI website using Docker containers.

## 📋 Prerequisites

1. **Install Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
   - Download from: https://www.docker.com/products/docker-desktop
   - Verify installation: `docker --version`

2. **Install Docker Compose** (usually comes with Docker Desktop)
   - Verify installation: `docker-compose --version`

## 🛠️ Step-by-Step Deployment

### Step 1: Environment Setup

1. **Create environment file:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your actual values:
   ```env
   # Replace with your secure password
   DB_PASSWORD=my_secure_password_123
   
   # Get free API key from: https://openweathermap.org/api
   OPENWEATHER_API_KEY=your_actual_api_key_here
   
   # Generate a secure secret key
   SECRET_KEY=your_very_secure_secret_key_here
   
   ENVIRONMENT=production
   DEBUG=false
   ```

### Step 2: Build and Start Containers

1. **Build all containers:**
   ```bash
   docker-compose build
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Check container status:**
   ```bash
   docker-compose ps
   ```

### Step 3: Verify Deployment

1. **Check if all services are running:**
   ```bash
   docker-compose logs
   ```

2. **Test the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000/health
   - Database: localhost:5432 (if you need to connect directly)

## 🌐 Domain Configuration Options

### Option 1: Local Development (Testing)
- **URL**: http://localhost
- **Port**: 80 (default HTTP)

### Option 2: Custom Domain (Production)

#### Method A: Using Cloudflare (Free & Easy)
1. **Sign up for Cloudflare** (free tier available)
2. **Add your domain** to Cloudflare
3. **Point DNS** to your server IP
4. **Enable SSL** automatically with Cloudflare

#### Method B: Self-Hosted Domain
1. **Buy a domain** from Namecheap, GoDaddy, etc.
2. **Point DNS A record** to your server IP
3. **Configure SSL** with Let's Encrypt

#### Method C: Docker with Domain
Update `docker-compose.yml` frontend service:
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  container_name: krishimitraai-frontend
  ports:
    - "80:80"
    - "443:443"
  environment:
    - VIRTUAL_HOST=yourdomain.com
    - LETSENCRYPT_HOST=yourdomain.com
```

### Option 3: Cloud Deployment Services

#### AWS ECS
```bash
# Install AWS CLI and configure
aws configure
# Deploy using ECS
docker-compose -f docker-compose.prod.yml up
```

#### Google Cloud Run
```bash
# Install gcloud CLI
gcloud auth login
gcloud config set project your-project-id
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/your-project-id/krishimitraai
```

#### Azure Container Instances
```bash
# Install Azure CLI
az login
# Deploy to Azure
az container create --resource-group myResourceGroup --file docker-compose.yml
```

## 🔧 Useful Docker Commands

### Container Management
```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Stop containers
docker-compose stop

# Start containers
docker-compose start

# Restart containers
docker-compose restart

# Remove containers and volumes
docker-compose down -v
```

### Logs and Debugging
```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f

# Execute commands inside container
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Updates and Maintenance
```bash
# Pull latest images
docker-compose pull

# Rebuild after code changes
docker-compose build --no-cache

# Update specific service
docker-compose up -d --build backend
```

## 📊 Monitoring and Health Checks

### Built-in Health Checks
- **Backend**: `/health` endpoint
- **Frontend**: HTTP response check
- **Database**: PostgreSQL connection test
- **Redis**: Redis ping test

### Monitoring Commands
```bash
# Check service health
docker-compose exec backend curl http://localhost:8000/health

# View resource usage
docker stats

# Check container health status
docker inspect krishimitraai-backend | grep Health
```

## 🔒 Security Considerations

1. **Change default passwords** in `.env` file
2. **Use HTTPS** in production (Cloudflare makes this easy)
3. **Regular updates**: `docker-compose pull && docker-compose up -d`
4. **Firewall configuration**: Only expose necessary ports
5. **Backup database**: `docker-compose exec postgres pg_dump`

## 🚨 Troubleshooting Common Issues

### Port Conflicts
```bash
# Check what's using port 80
netstat -tulpn | grep :80
# Or use different port in docker-compose.yml
ports:
  - "8080:80"  # Use port 8080 instead
```

### Permission Issues
```bash
# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
# Logout and login again
```

### Database Connection Issues
```bash
# Check database container
docker-compose exec postgres psql -U postgres -d krishimitraai

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

### Frontend Build Issues
```bash
# Clear node_modules and rebuild
docker-compose exec frontend rm -rf node_modules
docker-compose build --no-cache frontend
```

## 📈 Scaling and Performance

### Increase Resources
```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### Load Balancing
```yaml
# Multiple backend instances
services:
  backend:
    deploy:
      replicas: 3
```

## 🎯 Production Deployment Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Database backed up
- [ ] Monitoring set up
- [ ] Firewall configured
- [ ] Domain DNS configured
- [ ] Health checks passing
- [ ] Load testing performed
- [ ] Security audit completed

## 📞 Support

If you encounter issues:

1. **Check logs**: `docker-compose logs`
2. **Verify configuration**: Check `.env` file
3. **Test locally**: Ensure it works before deploying
4. **Consult documentation**: Check each service's documentation
5. **Community help**: Docker forums, GitHub issues

---

## 🎉 Quick Start Summary

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your values

# 2. Build and deploy
docker-compose build
docker-compose up -d

# 3. Verify deployment
docker-compose ps
docker-compose logs

# 4. Access your application
# Frontend: http://localhost
# Backend: http://localhost:8000/health
```

That's it! Your KrishimitraAI application is now running in Docker containers. 🚀
