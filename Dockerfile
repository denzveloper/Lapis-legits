# Gunakan image resmi Node
FROM node:18

# Buat direktori kerja
WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install semua dependencies (termasuk devDependencies)
RUN npm install

# Copy semua source code
COPY . .

# Expose port dev server Next.js
EXPOSE 3000

# Jalankan next dev
CMD ["npm", "run", "dev"]
