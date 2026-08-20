# Gunakan image node alpine
FROM node:18-alpine

WORKDIR /app

# Copy package json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy sisa codingan
COPY . .

# --- ⚡ BAGIAN PENTING: TANGKAP VARIABEL DARI RAILWAY ---
# Pastikan nama variabelnya sama persis dengan yang ada di menu Variables Railway
ARG NEXT_PUBLIC_API_URL_PRODUCTION
ENV NEXT_PUBLIC_API_URL_PRODUCTION=$NEXT_PUBLIC_API_URL_PRODUCTION
# ---------------------------------------------------------

# LAKUKAN BUILD NEXT.JS (Sekarang build akan membaca variabel di atas)
RUN npm run build

EXPOSE 3000

# Jalankan mode production
CMD ["npm", "run", "start"]
