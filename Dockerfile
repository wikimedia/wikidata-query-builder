FROM node:20.15.0
RUN apt-get update && \
	apt-get install -y \
		ca-certificates \
		build-essential \
		git \
		xvfb libnss3 libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libxss1 libasound2 libxtst6 xauth \
		chromium

ARG UID=1000
ARG GID=1000

RUN groupmod -g $GID node && usermod -u $UID -g $GID node
RUN npm install --global npm

USER node
