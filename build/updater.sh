#!/bin/bash
cd /data/project/query-builder-test/query-builder-deploy
git checkout master
git reset --hard origin/master
git pull
rm -rf public_html/*
cp -R . ../public_html/
