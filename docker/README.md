# Dockerfile

This docker file let you run hyde.

## Install

In this directory:
```
docker build -t mainfame-website-build .
```

## Run/Usage

In the main directory:

### Preview mode

```
docker run -it --rm -p 8080:8080 -v "$(pwd)":/root/website mainfame-website-build hyde serve -a 0.0.0.0
```

### Generate static pages

```
docker run -it --rm -v "$(pwd)":/root/website mainfame-website-build hyde gen
```
