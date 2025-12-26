# Use Node 20 as the base image
FROM node:20-bookworm

# Set working directory
WORKDIR /app

# Install global dependencies
# Ionic CLI, Angular CLI, and Cordova are essential for this project
RUN npm install -g @ionic/cli @angular/cli cordova native-run

# Expose ports
# 8100: Ionic Dev Server
# 35729: Live Reload
EXPOSE 8100 35729

# Default command
CMD ["ionic", "serve", "--host", "0.0.0.0", "--disable-host-check"]
