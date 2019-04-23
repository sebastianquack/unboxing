echo "unplug any devices"
read -p "Press enter when unplugged"
adb disconnect
echo

echo "start device in download mode - restart and hold home + power + down"
read -p "Press enter when done"
echo

echo "plug usb to device"
read -p "Press enter to flash twrp"
sudo heimdall flash --RECOVERY files/twrp-3.3.0-0-gts28velte.img --no-reboot
echo

echo "reboot directly into recovery mode (akrobat mode: hold power + down until screen dark, then quickly press and hold power + home + up until it says recovery booting"
read -p "Press when in twrp"
echo

echo "wipe -> format data -> yes"
read -p "Press when wiped"
echo

echo "wipe -> advanced wipe -> wipe /cache /dalvik_cache and /system"
read -p "Press when done"
echo

echo "advanced -> adb sideload"
read -p "Press when sideload active (after slide to activate)"
adb sideload files/lineage-16.0-20190410_155303-UNOFFICIAL-gts28velte.zip
echo

echo "advanced -> adb sideload again"
read -p "Press when sideload active again"
adb sideload files/addonsu-16.0-arm64.zip
echo

sleep 1
echo "removing setup wizard"
adb shell mount /system
adb shell rm -rf /system/priv-app/SetupWizard
adb shell mv /system/priv-app/LineageSetupWizard /sdcard
echo

echo "installing settings"
cd src/fs
./adb_upload.sh
echo ../../
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
setprop persist.adb.tcp.port 5555
getprop | grep adb
echo

echo "Settings -> system -> advanced -> screen lock -> none"
read -p "Press enter when done"
echo

echo "setting time, disabling NTP"
adb shell 'settings put global auto_time 0'
adb shell 'setprop persist.sys.timezone "Europe/Berlin"'
adb shell 'date @`date +%s`'
adb shell 'am broadcast -a android.intent.action.TIME_SET'
adb shell 'date'
echo

echo "note the mac address (d0:...) in the inventory table"
adb shell 'ip address'
read -p "Press enter when noted"
echo

echo "install app with unboxing-app/bin/deploy_production and download assets"
read -p "Press enter to finish"
echo

echo "congratulations"


