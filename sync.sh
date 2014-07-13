#!/bin/bash

SERVER=root@v4.kreativitaet-trifft-technik.de:/var/www/
LOCAL=deploy/

rsync -n -zvcrluPi --delete --exclude-from=sync-ignores -e 'ssh -p 2205' $LOCAL $SERVER

echo ""
echo "Das war ein dry run! rsync wirklich ausführen?"
echo "Strg + C zum Abbrechen oder Enter zum fortsetzen"
read IN

echo "run"
rsync -zvcrluPi --delete --exclude-from=sync-ignores -e 'ssh -p 2205' $LOCAL $SERVER
ssh -p 2205 root@v4.kreativitaet-trifft-technik.de "chmod -R a+r /var/www/"
