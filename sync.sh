#!/bin/bash

SERVER=root@v4.kreativitaet-trifft-technik.de:/var/www/website/
LOCAL=deploy/

rsync -n -zvcrluPi --delete --exclude-from=sync-ignores -e 'ssh -p 2206' $LOCAL $SERVER

echo ""
echo "Das war ein dry run! rsync wirklich ausführen?"
echo "Strg + C zum Abbrechen oder Enter zum fortsetzen"
read IN

echo "run"
git log -1 --format="%h - %aN - %ai" > deploy/status.txt
rsync -zvcrluPi --delete --exclude-from=sync-ignores -e 'ssh -p 2206' $LOCAL $SERVER
rm deploy/status.txt
ssh -p 2206 root@v4.kreativitaet-trifft-technik.de "chmod -R a+r /var/www/website/ && chmod o+w /var/www/website/sponsors"

