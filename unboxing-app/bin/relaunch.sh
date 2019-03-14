#!/bin/bash

set -x

## declare an array variable
#declare -a deviceIds=("17") ## You can access them using "${deviceIds[0]}", "${deviceIds[1]}" 
deviceIds=( "$@" )

## loop over deviceIds
for i in "${deviceIds[@]}"
do
   echo $i
   if [ $i -lt 10 ]
   then
     i="0${i}";
   fi

   echo "connecting to device ${i}"
   adb disconnect
   adb connect "192.168.8.1${i}:5555"

   echo "stopping app"
   adb shell am force-stop com.unboxing

   adb shell input keyevent 82

   echo "starting app"
   adb shell am start -n com.unboxing/com.unboxing.MainActivity
   
done
