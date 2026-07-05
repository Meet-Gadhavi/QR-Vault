FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose the default port for Hugging Face Spaces
EXPOSE 7860
ENV PORT=7860

CMD ["npm", "start"]
