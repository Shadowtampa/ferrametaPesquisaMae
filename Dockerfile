# Build: instala dependências (workspaces) e compila o frontend
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --omit=dev

# Runtime: só o necessário para rodar o servidor + front já compilado
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist

EXPOSE 3001
CMD ["node", "server/index.js"]
