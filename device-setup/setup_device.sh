#!/bin/bash

echo "start device in download mode"
read -p "Press enter when done"
echo

echo "plug usb to device"
read -p "Press enter to flash twrp (enter computer password when asked)"
adb disconnect
set +e
kextstat | grep -v apple | grep com.devguru.com.devguru.SamsungMTP
if [ $? -eq 0 ] 
then
  sudo kextunload -b com.devguru.com.devguru.SamsungMTP
fi

kextstat | grep -v apple | grep com.devguru.driver.SamsungComposite
if [ $? -eq 0 ] 
then
  sudo kextunload -b com.devguru.driver.SamsungComposite
fi
kextstat | grep -v apple | grep com.devguru.driver.SamsungACMData
if [ $? -eq 0 ]
then
  sudo kextunload -b com.devguru.driver.SamsungACMData
fi
kextstat | grep -v apple | grep com.devguru.driver.SamsungACMControl
if [ $? -eq 0 ]
then
  sudo kextunload -b com.devguru.driver.SamsungACMControl
fi

sudo heimdall flash --RECOVERY files/twrp-3.3.0-0-gts28velte.img --no-reboot
echo

echo "reboot directly into recovery mode (akrobatik)"
read -p "Press when in twrp"
echo

echo "wipe -> format data -> yes"
read -p "Press when wiped"
echo

echo "formatting partitions"

adb shell twrp wipe cache
sleep 2
adb shell twrp wipe system
sleep 2
adb shell twrp wipe dalvik
sleep 3
adb shell twrp wipe data
sleep 2

echo "uploading os (ignore the error)"
adb shell twrp sideload
sleep 2
adb sideload files/lineage-16.0-20190410_155303-UNOFFICIAL-gts28velte.zip
sleep 2
adb shell twrp sideload
sleep 2
adb sideload files/addonsu-16.0-arm64.zip
sleep 2

echo "removing setup wizard"
adb shell mount /system
adb shell rm -rf /system/priv-app/SetupWizard
adb shell mv /system/priv-app/LineageSetupWizard /sdcard
echo

echo "installing settings"
cd src/fs
./adb_upload.sh
cd ../../
echo

echo "Rebooting"
read -p "Press to reboot"
adb reboot
echo

echo "Settings -> system -> advanced -> developer options -> "
echo " - automatic updates OFF"
echo " - android debugging ON"
echo " - adb over network ON"
echo " - root access: ADB and apps"
read -p "Press enter when done"
adb root
sleep 1
adb shell 'setprop persist.adb.tcp.port 5555'
adb shell 'getprop | grep adb'
echo

echo "Settings -> security & location -> screen lock -> none"
read -p "Press enter when done"
echo

echo "setting time, disabling NTP"
adb shell 'settings put global auto_time 0'
adb shell 'setprop persist.sys.timezone "Europe/Berlin"'
adb shell 'date @`date +%s`'
adb shell 'am broadcast -a android.intent.action.TIME_SET'
adb shell 'date'
echo

echo "please make sure your computer is connected to the unboxing wifi (unboxing/87542000)"
read -p "Press enter when connected"
echo

echo -n "Type the number of the device, followed by [ENTER]: "
read i
   if [ $i -lt 10 ]
   then
     i="0${i}";
   fi
echo $i
IP=192.168.8.1$i
MAC=$(adb shell 'cat /sys/class/net/wlan0/address')
echo IP is going to be $IP
echo MAC is $MAC
echo
echo "adding addresses to ethers..."
pwd
echo >> ../unboxing-raspi/ethers
echo $MAC $IP >> ../unboxing-raspi/ethers
cat ../unboxing-raspi/ethers
../unboxing-raspi/bin/install_ethers 192.168.8.1
echo

read -p "Press enter to reboot"
adb reboot
echo

echo "remove usb cable"
read -p "Press enter when cable removed and device has rebooted"
echo

echo "installing app"
cd ../unboxing-app/
bin/deploy_production.sh $i
cd ../device-setup
read -p "Press enter to finish"
echo

echo "congratulations"


