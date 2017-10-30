from debian:stretch-slim

RUN set -ex && \
  apt-get update && apt-get install -y --no-install-recommends \
		git python2.7 python-pip wget python-imaging python-setuptools \
	&& rm -rf /var/lib/apt/lists/*

RUN set -ex && \
  pip install hyde==0.8.9

EXPOSE 8080

WORKDIR /root/website
