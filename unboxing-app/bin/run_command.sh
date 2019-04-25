#!/bin/bash

set +x

## declare an array variable
#declare -a deviceIds=("17") ## You can access them using "${deviceIds[0]}", "${deviceIds[1]}" 
deviceIds=( "$@" )

adb disconnect
adb root     

## loop over deviceIds
for i in "${deviceIds[@]}"
do
   if [ $i -gt 0 ]
  then
     echo $counter
     if [ $i -lt 10 ]
     then
       i="0${i}";
     fi

     echo "connecting to device ${i}"
     adb disconnect
     adb connect "192.168.8.1${i}:5555"     
     sleep 1

     adb shell "${deviceIds[0]}"
   fi


done