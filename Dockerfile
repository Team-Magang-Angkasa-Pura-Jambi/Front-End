# Gunakan image node alpine yang kecil
FROM node:18-alpine

WORKDIR /app

# Copy package json
COPY package*.json ./

# Install dependencies saja (tanpa build)
RUN npm install --legacy-peer-deps

# Copy sisa codingan
COPY . .

EXPOSE 3000

# Jalankan mode dev (langsung jalan tanpa nunggu build)
CMD ["npm", "run", "dev"]