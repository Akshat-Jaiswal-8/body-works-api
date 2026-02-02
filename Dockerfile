FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm ci


COPY prisma ./prisma

RUN npx prisma generate


COPY . .

EXPOSE 8000

CMD ["node", "server.js"]