#! /usr/bin/env bash

browsers=("chromium" "firefox" "firefox-esr" "chrome" "edge")

for browser in "${browsers[@]}"; do
    if [[ $(type -t $browser) == file ]]; then
        echo $browser
        exit 0
    fi
done

echo "electron" # default
