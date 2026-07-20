# Bella AI Platform - Production Build Dockerfile
FROM node:18-alpine AS runner

WORKDIR /app

# Install static file server globally
RUN npm install -g serve

# Copy static enterprise assets
COPY index.html ./
COPY app.js ./
COPY styles.css ./
COPY package.json ./
COPY ENTERPRISE_ARCHITECTURE_BLUEPRINT.md ./
COPY README.md ./

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["serve", "-s", ".", "-l", "3000"]
