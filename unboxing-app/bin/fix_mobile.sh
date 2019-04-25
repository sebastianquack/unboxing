#!/bin/bash

set +x

FS_DIR=$(git rev-parse --show-toplevel)/device-setup/src/fs
THIS_DIR=$(pwd)

## declare an array variable
#declare -a deviceIds=("17") ## You can access them using "${deviceIds[0]}", "${deviceIds[1]}" 
deviceIds=( "$@" )

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
     sleep 1
     adb connect "192.168.8.1${i}:5555"
     #adb wait-for-devices
     sleep 1
     adb root
     #adb wait-for-devices
     sleep 1
     read -p "continue (press any key or ctrl-c) ?"
     adb connect "192.168.8.1${i}:5555"
     sleep 1

     cd $FS_DIR
     adb shell 'settings  put  global  data_roaming0  0'
     sleep 4
     adb push data/user_de/0/com.android.providers.telephony/databases/telephony.db /data/user_de/0/com.android.providers.telephony/databases/telephony.db
     adb shell chown radio:radio /data/user_de/0/com.android.providers.telephony/databases/telephony.db
     adb shell chmod 660 /data/user_de/0/com.android.providers.telephony/databases/telephony.db
     sleep 5
     adb shell content insert --uri content://telephony/carriers/preferapn --bind apn_id:i:3478
     sleep 2
     #adb shell 'settings  put  global  data_roaming0  1'
     sleep 2
     adb reboot
     cd $THIS_DIR
   fi


done