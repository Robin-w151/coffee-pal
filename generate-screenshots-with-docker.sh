#!/bin/sh

check_is_installed() {
  program="$1"
  if ! command -v "$program"; then
    echo "$program is not installed!"
    exit 1
  fi

  return 0
}

check_is_installed docker

dockerfileName=d.screenshots.Dockerfile
imageName=coffee-pal-screenshots
playwrightVersion=$(node -p "require('@playwright/test/package.json').version")

docker build -t $imageName -f $dockerfileName --pull --build-arg tag="${playwrightVersion}" .
docker run -it --rm -v './static/screenshots:/app/screenshots' $imageName
