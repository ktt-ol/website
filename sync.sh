#!/bin/bash

SERVER=homepage@mainframe.io
REMOTE=/var/www/website/
LOCAL=deploy/
PORT=2310

rsync -n -zvcrluPi --delete --exclude-from=sync-ignores -e "ssh -p $PORT" $LOCAL "$SERVER:$REMOTE"

echo ""
echo "Das war ein dry run! rsync wirklich ausführen?"
echo "Strg + C zum Abbrechen oder Enter zum fortsetzen"
read IN

echo "run"
git log -1 --format="%h - %aN - %ai" > deploy/status.txt
rsync -zvcrluPi --delete --exclude-from=sync-ignores -e "ssh -p $PORT" $LOCAL "$SERVER:$REMOTE"
rm deploy/status.txt
ssh -p $PORT $SERVER "chmod -R a+r /var/www/website/"
