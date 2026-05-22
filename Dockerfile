FROM node:24-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

EXPOSE 3232

CMD ["node", "src/server.js"]
