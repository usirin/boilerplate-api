FROM umut/node-sodium:10.11.0

RUN mkdir -p /app
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .
