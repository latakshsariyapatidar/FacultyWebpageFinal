#!/bin/bash

# Faculty Website Docker Setup Script
# This script helps set up Docker and Docker Compose for the Faculty Website

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}\n"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check Docker installation
check_docker() {
    print_header "Checking Docker Installation"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo "Please install Docker from https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Docker installed: $(docker --version)"
    print_success "Docker Compose installed: $(docker-compose --version)"
}

# Create required directories
setup_directories() {
    print_header "Setting up Directory Structure"
    
    if [ ! -d "nginx/ssl" ]; then
        mkdir -p nginx/ssl
        print_success "Created nginx/ssl directory"
    fi
    
    if [ ! -d "backend/data" ]; then
        mkdir -p backend/data
        print_success "Created backend/data directory"
    fi
}

# Check SSL certificates
check_ssl_certs() {
    print_header "Checking SSL Certificates"
    
    if [ ! -f "nginx/ssl/nginx-SSL2025-26.pem" ]; then
        print_warning "SSL certificate not found: nginx/ssl/nginx-SSL2025-26.pem"
        echo "Please copy your SSL certificate to nginx/ssl/"
        return 1
    fi
    
    if [ ! -f "nginx/ssl/star_iitdh_key.key" ]; then
        print_warning "SSL key not found: nginx/ssl/star_iitdh_key.key"
        echo "Please copy your SSL key to nginx/ssl/"
        return 1
    fi
    
    print_success "SSL certificates found"
}

# Build images
build_images() {
    print_header "Building Docker Images"
    
    docker-compose build
    
    print_success "Docker images built successfully"
}

# Start services
start_services() {
    print_header "Starting Services"
    
    docker-compose up -d
    
    print_success "Services started"
    
    # Wait for services to be ready
    echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
    sleep 10
    
    # Check service status
    print_header "Service Status"
    docker-compose ps
}

# Display access information
show_access_info() {
    print_header "Access Information"
    
    echo "Services are now running at:"
    echo -e "  ${GREEN}Main Website: https://faculty.iitdh.ac.in${NC}"
    echo -e "  ${GREEN}API: https://faculty.iitdh.ac.in/api${NC}"
    echo -e "  ${GREEN}Admin Panel: https://faculty.iitdh.ac.in/admin${NC}"
    echo ""
    echo "View logs with:"
    echo "  docker-compose logs -f"
    echo ""
    echo "Stop services with:"
    echo "  docker-compose down"
}

# Main execution
main() {
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════╗"
    echo "║   Faculty Website Docker Setup         ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_docker
    setup_directories
    
    if ! check_ssl_certs; then
        print_warning "Proceeding without SSL certificates (needed for production)"
    fi
    
    read -p "Build Docker images? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_images
    fi
    
    read -p "Start services now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_services
        show_access_info
    else
        echo -e "\n${YELLOW}To start services later, run: docker-compose up -d${NC}\n"
    fi
}

main
