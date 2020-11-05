# Base Image.
# This image already exists in dockerhub.
# We are just extending its functionalities
FROM node:10
# Already created by the node image 
USER node
# Changes directory in the container to this directory
WORKDIR /home/node/app
# Port that the node app will listen to
EXPOSE 8000