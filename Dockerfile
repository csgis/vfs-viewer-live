# Base image for serving static files
FROM nginx:alpine

# Copy Vue.js build files to the Nginx container
COPY dist/ /usr/share/nginx/html/

# Expose port 80 for the Vue.js app
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
