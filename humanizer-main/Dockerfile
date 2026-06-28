FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund --no-package-lock --registry=https://registry.npmjs.org/

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund --no-package-lock --registry=https://registry.npmjs.org/

COPY --from=builder /app/build ./build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "build/index.js", "--gui"]