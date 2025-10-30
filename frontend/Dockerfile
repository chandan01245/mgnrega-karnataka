### Stage 1: build the React app
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies first (copy package files to leverage caching)
COPY package.json ./
# Install dependencies using npm and accept legacy peer deps to avoid ERESOLVE failures
RUN npm install --legacy-peer-deps

# Some CRA/webpack/plugins require specific ajv layout; ensure a compatible ajv is present
# so builds don't fail due to mismatched ajv/ajv-keywords versions
RUN npm install ajv@8.12.0 --no-save --legacy-peer-deps

# Copy source and build
COPY . .
# Allow injecting the backend URL at build time so the built JS calls the
# backend directly instead of relying on a runtime proxy. .env is excluded
# from the docker build context by .dockerignore, so we accept a build-arg.
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL:-}

RUN npm run build

### Stage 2: serve with nginx
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html

# Expose default HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
