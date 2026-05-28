FROM node:24-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
ENV PORT=3001
ENV MONGIDB_URI=mongodb+srv://saranga:saranga@cluster0.u9gdwrb.mongodb.net/event_registration
EXPOSE 3001
CMD ["npm", "run", "dev"]