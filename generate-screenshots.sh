#!/bin/sh -e

dockerfileName=screenshots.Dockerfile
imageName=coffee-pal-screenshots

docker build -t $imageName -f $dockerfileName .
docker run -it --rm -v './static/screenshots:/app/screenshots' $imageName
