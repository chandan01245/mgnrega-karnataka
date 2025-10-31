### Multi-stage Dockerfile to run frontend (static) + backend (uvicorn) together
### Stage 1: build the React frontend
FROM node:20-alpine AS node_build
WORKDIR /tmp/frontend

# Copy frontend sources
COPY frontend/package.json frontend/package-lock.json* frontend/yarn.lock* ./
COPY frontend/ ./

# Install deps and build
RUN npm install --legacy-peer-deps \
  && npm install ajv@8.12.0 --no-save --legacy-peer-deps \
  && npm run build

### Stage 2: runtime image with Python, nginx and supervisord
FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       nginx \
       supervisor \
       build-essential \
       gcc \
       libssl-dev \
       libffi-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ /app

# Copy built frontend from node stage into nginx html dir
COPY --from=node_build /tmp/frontend/build /usr/share/nginx/html

# Nginx config: serve static and proxy /api to uvicorn
RUN rm /etc/nginx/sites-enabled/default || true
RUN printf '%s\n' \
  'server {' \
  '  listen 80;' \
  '  server_name _;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html index.htm;' \
  '' \
  '  location / {' \
  '    try_files $uri $uri/ /index.html;' \
  '  }' \
  '' \
  '  location /api/ {' \
  '    proxy_pass http://127.0.0.1:8000/;' \
  '    proxy_set_header Host $host;' \
  '    proxy_set_header X-Real-IP $remote_addr;' \
  '    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
  '    proxy_set_header X-Forwarded-Proto $scheme;' \
  '  }' \
  '}' > /etc/nginx/conf.d/default.conf

# Supervisor config to run both nginx and uvicorn
RUN mkdir -p /etc/supervisor/conf.d
RUN printf '%s\n' \
  '[supervisord]' \
  'nodaemon=true' \
  '' \
  '[program:nginx]' \
  'command=/usr/sbin/nginx -g "daemon off;"' \
  'autorestart=true' \
  'stdout_logfile=/dev/stdout' \
  'stdout_logfile_maxbytes=0' \
  'stderr_logfile=/dev/stderr' \
  'stderr_logfile_maxbytes=0' \
  '' \
  '[program:uvicorn]' \
  'command=uvicorn server:app --host 127.0.0.1 --port 8000' \
  'directory=/app' \
  'autorestart=true' \
  'stdout_logfile=/dev/stdout' \
  'stdout_logfile_maxbytes=0' \
  'stderr_logfile=/dev/stderr' \
  'stderr_logfile_maxbytes=0' \
  > /etc/supervisor/conf.d/supervisord.conf

ENV PYTHONUNBUFFERED=1

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
