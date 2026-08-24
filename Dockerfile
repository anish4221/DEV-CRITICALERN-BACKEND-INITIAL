# 1. Use a lightweight, official long-term support Node version
FROM node:20-alpine

# 2. Define the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy package configuration files first
# This lets Docker cache your npm layers if dependencies haven't changed
COPY package*.json ./

# 4. Install production dependencies cleanly (ignores devDependencies)
RUN npm ci --only=production

# 5. Copy the rest of your application files
COPY . .

# 6. Expose the port your application listens on (e.g., 3000)
EXPOSE 5000

# 7. Start the application
CMD [ "node", "index.js" ]