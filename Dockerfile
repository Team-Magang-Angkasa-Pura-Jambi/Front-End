# Gunakan image node alpine yang kecil
FROM node:18-alpine

WORKDIR /app

# Copy package json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy sisa codingan
COPY . .

# LAKUKAN BUILD NEXT.JS (Ini yang sebelumnya kurang!)
RUN npm run build

EXPOSE 3000

# Jalankan mode production (bukan mode dev)
CMD ["npm", "run", "start"]
