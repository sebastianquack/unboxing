# Unboxing Mozart Client App

## install

````
npm install
````

## run

````
react-native run-android
````

## contribute
Please use npm > 5.4.0, which corresponds to node > 8.7. Because of https://github.com/npm/npm/issues/19255
````
npm install --global n
n 8
npm --version
````

## notes

- log: `react-native log-android`
- open dev menu on device: `adb shell input keyevent KEYCODE_MENU`
- clear caches: `watchman watch-del-all && rm -rf $TMPDIR/react-native-packager-cache-* && rm -rf $TMPDIR/metro-bundler-cache-* && npm start -- --reset-cache`

## set up ntp server on os x

1. edit `/etc/ntp-restrict.conf` and adjust "restrict" to your network, e.g. `restrict 192.168.178.0 mask 255.255.0.0`
2. restart ntpd `sudo killall ntpd`
3. check if ntpd responds: `ntpdate -d localhost`

## rename project

- rename project in app.json, index.js and package.json
- remove npm_modules directory
- run `npm install`
- backup sound files or other assets in ios or android directories
- remove ios and android directories
- run `react-native eject`
- replace sound files or other assets in ios or android directories
- run `react-native link`
- react-clock-sync needs `react-native link react-native-udp`

## set default server ip address 

- copy localConfig.json in the app's directory on the device (created automatically after new install of app) /Android/data/com.unboxing/files 

## build apk

`react-native bundle --dev false --platform android --entry-file index.js --bundle-output ./android/app/build/intermediates/assets/debug/index.android.bundle --assets-dest ./android/app/build/intermediates/res/merged/debug`

`cd android && ./gradlew assembleRelease`




