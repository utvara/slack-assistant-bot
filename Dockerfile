# ---- Base Node ----
FROM node:18 AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ---- Release ----
FROM node:18-alpine AS release
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=base /app/dist ./dist

CMD ["npm", "start"]
