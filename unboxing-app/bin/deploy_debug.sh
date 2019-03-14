#!/bin/bash

set -x

## declare an array variable
#declare -a deviceIds=("17") ## You can access them using "${deviceIds[0]}", "${deviceIds[1]}" 
deviceIds=( "$@" )

cd android

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

   echo "uninstalling app"
   adb uninstall com.unboxing

   echo "installing app"
   adb install "./app/build/outputs/apk/debug/app-debug.apk"

   adb shell pm grant com.unboxing android.permission.SYSTEM_ALERT_WINDOW
   adb shell pm grant com.unboxing android.permission.ACCESS_COARSE_LOCATION
   adb shell pm grant com.unboxing android.permission.READ_EXTERNAL_STORAGE
   adb shell pm grant com.unboxing android.permission.WRITE_EXTERNAL_STORAGE
   adb shell pm grant com.unboxing android.permission.READ_PHONE_STATE

   adb shell "run-as com.unboxing mkdir /data/data/com.unboxing/shared_prefs/"

   echo "setting up config for debug server"
   adb push ../bin/com.unboxing_preferences.xml /sdcard/com.unboxing_preferences.xml
   adb shell "run-as com.unboxing cp /sdcard/com.unboxing_preferences.xml /data/data/com.unboxing/shared_prefs/com.unboxing_preferences.xml"

   adb shell "mkdir /sdcard/unboxing"   

   adb shell settings put system screen_off_timeout 300000

   echo "starting app"
   adb shell am start -n com.unboxing/com.unboxing.MainActivity


done

cd ..
