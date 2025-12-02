FROM node:18-slim

# Dependencias necesarias para Chromium
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    libgtk-3-0 \
    libasound2 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    libxshmfence1 \
    libglib2.0-0 \
    libgdk-pixbuf2.0-0 \
    libgbm1 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    libdrm2 \
    fonts-liberation \
    libu2f-udev \
    xdg-utils \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /home/node/app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar resto del proyecto
COPY . .

# Variable con ruta a Chromium
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"

# Exponer el puerto API
EXPOSE 3000

CMD ["node", "index.js"]
