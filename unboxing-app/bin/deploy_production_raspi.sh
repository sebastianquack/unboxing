#!/bin/bash

# copy app-release to raspi

set -e

command=`basename "$0"`
if [ $# -lt 1 ]
  then
    echo "usage: $command <host>"
    echo "example: $command 192.168.8.1"
    exit
fi

USERNAME=pi

IDENTITY=$(git rev-parse --show-toplevel)/unboxing-raspi/id_rsa

echo "deloying to $USERNAME@$1"

cd $(git rev-parse --show-toplevel)/unboxing-app

echo "Uploading..."
scp -i $IDENTITY android/app/build/outputs/apk/release/app-release.apk $USERNAME@$1:/home/pi/

