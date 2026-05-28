FROM node:24-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "run", "dev"]