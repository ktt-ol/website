# Dockerfile

This docker file let you run hyde.

## Install

In this directory:
```
docker build -t mainfame-website-build .
```

## Run/Usage

In the main directory:
```
docker run -it --rm -v "$(pwd)":/root/website mainfame-website-build hyde gen
```
