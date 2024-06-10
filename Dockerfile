# ---- Base Node ----
FROM node:18 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# ---- Release ----
FROM node:18-alpine AS release
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY --from=base /app/dist ./dist

CMD ["npm", "start"]
