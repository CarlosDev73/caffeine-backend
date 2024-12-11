# Usar la imagen oficial de Node.js
FROM node:20

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto en el que corre la app
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD [ "node", "src/index.js" ]
