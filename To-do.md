### To do
- [ ] 3. Understand what each stats of the dashboard make sense


### Important Commands
# Backend
docker start cloudmonitor-backend
docker stop cloudmonitor-backend

# Frontend
docker build -t cloudmonitor-frontend:latest ./cloudmonitor-frontend
docker run -d --name cloudmonitor-frontend -p 5173:80 cloudmonitor-frontend:latest
docker stop cloudmonitor-frontend
docker start cloudmonitor-frontend


# View container logs
docker logs -f cloudmonitor-frontend

# Stop container
docker stop cloudmonitor-frontend

# Start container
docker start cloudmonitor-frontend

# Remove container
docker rm -f cloudmonitor-frontend