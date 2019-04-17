#!/bin/bash

# set -x

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

   echo "pinging device at 192.168.8.1${i} ( ctrl-z to abort )"
   ping -o -n -W 2 -i 2  192.168.8.1${i} &> /dev/null
   echo "device discovered"

   echo "connecting to device ${i}"
   adb disconnect
   adb connect "192.168.8.1${i}:5555"

   sleep 1

   echo "initializing reboot"
   adb reboot

done
