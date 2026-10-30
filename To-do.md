### To do
- [x] 3. Understand what each stats of the dashboard make sense and how they help us to monitor the health of the application. (10%) 20 minutes
- [x] make the ui more interactive and user friendly. (10%) 60 minutes
- [x] we can add hover effect on each state to show more information about that state
- [x] we should make the dashboard of one page only and user can click some stats to know more about them
- [ ] make the ui more interactive and user friendly. (10%) 60 minutes

### need to understand more
- [] we can show the trend of the stats in the dashboard
- [] we can add a feature to set alert on some stats if it goes beyond the threshold
- [] we can add notification on the ui for the alert
- [] we can add a feature to rollback the deployment if it goes beyond the threshold

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