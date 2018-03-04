# Unboxing Mozart Client App

## install
````
yarn install
````

## run

````
react-native run-android
````

## notes

- log: `react-native log-android`
- open dev menu on device: `adb shell input keyevent KEYCODE_MENU`

## set up ntp server on os x

1. edit `/etc/ntp-restrict.conf` and adjust "restrict" to your network, e.g. `restrict 192.168.178.0 mask 255.255.0.0`
2. restart ntpd `sudo killall ntpd`
3. check if ntpd responds: `ntpdate -d localhost`

## rename project

- rename project in app.json, index.js and package.json
- remove npm_modules directory
- run `yarn install`
- backup sound files or other assets in ios or android directories
- remove ios and android directories
- run `react-native eject`
- replace sound files or other assets in ios or android directories
- run `react-native link`
- react-clock-sync needs `react-native link react-native-udp`

## build apk

`cd android && ./gradlew assembleRelease`