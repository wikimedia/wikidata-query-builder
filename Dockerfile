FROM node:12

RUN apt-get update && \
	apt-get install -y \
		ca-certificates \
		build-essential \
		python-pkgconfig \
		git \
		xvfb libnss3 libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libxss1 libasound2 libxtst6 xauth \
		chromium

ARG UID=1000
ARG GID=1000

RUN addgroup --gid $GID runuser && adduser --uid $UID --gid $GID --disabled-password --gecos "" runuser
RUN npm install --global npm@6.14.8

USER runuser
