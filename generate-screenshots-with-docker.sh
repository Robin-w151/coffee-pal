#!/bin/sh

checkIsInstalled() {
  program="$1"
  if ! command -v "$program"; then
    echo "$program is not installed!"
    exit 1
  fi
}

checkIsInstalled docker

dockerfileName=d.screenshots.Dockerfile
imageName=coffee-pal-screenshots
playwrightVersion=$(node -p "require('@playwright/test/package.json').version")

docker build -t $imageName -f $dockerfileName --pull --build-arg tag="${playwrightVersion}" .
docker run -it --rm -v './static/screenshots:/app/screenshots' $imageName
