#!/bin/bash

set -euo pipefail

git clone "https://gerrit.wikimedia.org/r/wikidata/query-builder/deploy" ./dist-deploy
git -C ./dist-deploy \
	remote set-url --push origin \
	ssh://wdqsguibuilder@gerrit.wikimedia.org:29418/wikidata/query-builder/deploy
curl -Lo ./dist-deploy/.git/hooks/commit-msg https://gerrit.wikimedia.org/r/tools/hooks/commit-msg
chmod +x ./dist-deploy/.git/hooks/commit-msg
# Empty the build dir (excluding .git), preparing for the new build
find ./dist-deploy/ -maxdepth 1 \
	! -wholename "./dist-deploy/" \
	! -wholename "./dist-deploy/.git" \
	-exec rm -r {} +