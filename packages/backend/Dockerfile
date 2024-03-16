#FROM node:18.16.0
#
#WORKDIR /app
#COPY package*.json .
#RUN npm i
#
#COPY . .
#
#EXPOSE 4000
#
#CMD npm start

# Use a Node.js base image
FROM node:18-alpine AS base

# Install Turbo globally
RUN npm i -g turbo


# Prune the monorepo for the specific app
WORKDIR /app
COPY . .
RUN turbo prune backend --docker

# Install dependencies
FROM node:18-alpine AS installer
WORKDIR /app
COPY --from=base /app/out/json/ .
RUN npm ci

# Copy the rest of the application
COPY --from=base /app/out/full/ .


FROM node:18-alpine as migrator

RUN npm i -g turbo

WORKDIR /app
COPY --from=installer /app .
RUN turbo migrations:gen --filter=backend

# Build the application
# Final stage for running the application
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=migrator /app .

# Expose the port your application runs on
EXPOSE 4000

# Command to start your application
CMD  cd packages/backend && ../../node_modules/.bin/drizzle-kit push:pg && npm start
