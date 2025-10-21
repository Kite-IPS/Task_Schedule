FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variables for production
ENV NODE_ENV=production
ENV VITE_API_URL=http://122.248.224.53:8000

# Build the app
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# Expose port 80
EXPOSE 80

# Start the app
CMD ["serve", "-s", "dist", "-l", "80"]