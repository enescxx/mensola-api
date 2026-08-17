FROM node:18-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./ 
RUN npm install

FROM base AS development
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]


FROM base AS builder
WORKDIR /usr/src/app
COPY . .
RUN npm run build

FROM node:18-alpine AS production 
WORKDIR /usr/src/app
COPY package*.json ./ 
RUN npm install --only=production
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/migrations ./dist/migrations
EXPOSE 3000
CMD ["npm", "start"]
