#build stage

FROM node:22-alpine as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

#production stage

FROM node:22-alpine as production-stage

WORKDIR /app

RUN npm install -g serve

ENV PATH="/usr/local/bin:$PATH"

COPY --from=build-stage /app/dist ./dist

EXPOSE 5000

CMD ["serve", "-s", "dist", "-l", "5000"]