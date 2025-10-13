FROM n8nio/n8n:latest

USER root

# Copy the custom nodes folder
COPY ./dist /home/node/.n8n/custom/node_modules/steam-custom-node

# Copy icon file
COPY ./nodes/SteamClient/steam.svg /home/node/.n8n/custom/node_modules/steam-custom-node/

# Switch back to the node user
USER node

# Set the working directory
WORKDIR /home/node

# Use the default entrypoint and CMD from the base image