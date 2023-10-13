#!/bin/sh

checkIsInstalled() {
  program="$1"
  if ! command -v "$program"; then
    echo "$program is not installed!"
    exit 1
  fi
}

checkIsInstalled docker

dockerfileName=screenshots.Dockerfile
imageName=coffee-pal-screenshots

docker build -t $imageName -f $dockerfileName .
docker run -it --rm -v './static/screenshots:/app/screenshots' $imageName
