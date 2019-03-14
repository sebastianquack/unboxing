#!/bin/bash

set -x

## declare an array variable
declare -a deviceIds=("17" "21") ## You can access them using "${deviceIds[0]}", "${deviceIds[1]}" 

cd android

## loop over deviceIds
for i in "${deviceIds[@]}"
do
   echo "connecting to device ${i}"
   adb disconnect
   adb connect "192.168.8.1${i}:5555"

   echo "stopping app"
   adb shell am force-stop com.unboxing

   echo "uninstalling app"
   adb uninstall com.unboxing

   echo "installing app"
   adb install "./app/build/outputs/apk/debug/app-debug.apk"

   adb shell "run-as com.unboxing mkdir /data/data/com.unboxing/shared_prefs/"

   echo "setting up config for debug server"
   adb push ../bin/com.unboxing_preferences.xml /sdcard/com.unboxing_preferences.xml
   adb shell "run-as com.unboxing cp /sdcard/com.unboxing_preferences.xml /data/data/com.unboxing/shared_prefs/com.unboxing_preferences.xml"

   echo "starting app"
   adb shell am start -n com.unboxing/com.unboxing.MainActivity


done

cd ..
