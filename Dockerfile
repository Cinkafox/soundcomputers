FROM node:19-alpine

RUN set -x \
    && add-apt-repository ppa:mc3man/trusty-media \
    && apt-get update \
    && apt-get dist-upgrade \
    && apt-get install -y --no-install-recommends \
        ffmpeg 
        
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . ./
CMD npm start