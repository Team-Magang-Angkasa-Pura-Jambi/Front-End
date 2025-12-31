# Gunakan image Node.js versi Long-Term Support (LTS) yang cocok
FROM node:18-alpine

# Set direktori kerja di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json (atau yarn.lock) terlebih dahulu
# Ini memanfaatkan cache layer Docker, sehingga 'npm install' tidak selalu dijalankan
# jika dependensi tidak berubah.
COPY package*.json ./

# Install semua dependensi, termasuk devDependencies
RUN npm install

# Salin sisa kode aplikasi. Perubahan selanjutnya akan di-handle oleh volume.
COPY . .

# Expose port default untuk server pengembangan Next.js/React
EXPOSE 3000

# Perintah untuk menjalankan server pengembangan
# Pastikan script 'dev' ada di package.json Anda
CMD ["npm", "run", "dev"]
