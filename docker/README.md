# Dockerfile

This docker file let you run hyde.

## Install

In this directory:
```
docker build -t mainframe-website-build .
```

## Run/Usage

In the main directory:

### Preview mode

```
docker run -it --rm --user `id -u` -p 8080:8080 -v "$(pwd)":/tmp/website mainframe-website-build hyde serve -a 0.0.0.0
```

### Generate static pages

```
docker run -it --rm --user `id -u` -v "$(pwd)":/tmp/website mainframe-website-build hyde gen
```
