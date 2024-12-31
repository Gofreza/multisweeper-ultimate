# Use an official Node.js runtime as the base image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend
RUN npm run build

# Expose the port the backend will run on
EXPOSE 3000

# Start the backend
CMD ["npm", "start"]
