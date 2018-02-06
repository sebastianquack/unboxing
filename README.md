# Unboxing Mozart

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

## rename project

- rename project in app.json, index.js and package.json
- remove npm_modules directory
- run `yarn install`
- backup sound files or other assets in ios or android directories
- remove ios and android directories
- replace sound files or other assets in ios or android directories
- run `react-native eject`
- run `react-native link`
- react-clock-sync needs `react-native link react-native-udp`
