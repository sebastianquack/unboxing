#!/bin/bash

# resize assets to given width

command=`basename "$0"`
if [ $# -lt 4 ]
  then
    echo "usage: $command <ext> <source dir> <target dir> <width>"
    echo "example: $command .png ./ ./small/ 200"
    echo "note: target will be overwritten"
    exit
fi


EXTENSION=$1 #
INFILES_PREFIX=$2
OUTFILES_PREFIX=$3
WIDTH=$4

for i in ${INFILES_PREFIX}*${EXTENSION};
  do INFILE=$i;
  OUTFILE=${OUTFILES_PREFIX}`basename ${i}`
  echo $INFILE " -> " "$OUTFILE";
  ffmpeg -y -i "${INFILE}" -vf scale=${WIDTH}:-1 "${OUTFILE}";
done
