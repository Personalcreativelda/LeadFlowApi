FROM node:18-alpine

# Instalar dependências necessárias para healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Expor portas
EXPOSE 5173 4173

# Comando padrão (será sobrescrito pelo docker-compose)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
