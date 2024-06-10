FROM node:22 as base

# The WORKDIR instruction sets the working directory for everything that will happen next
WORKDIR /app

# Copy all local files into the image
COPY . .

# Clean install all node modules
RUN npm ci

# Build SvelteKit app
RUN npx prisma generate
RUN npm run build


# The USER instruction sets the user name to use as the default user for the remainder of the current stage
#USER node:node

COPY startServer.sh /app/
RUN chmod 777 /app/startServer.sh
RUN chmod +x /app/startServer.sh
ENTRYPOINT ["sh", "/app/startServer.sh"]


# This is the command that will be run inside the image when you tell Docker to start the container
#CMD ["node","build/index.js"]