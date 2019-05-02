cd android

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

   adb shell "mkdir /sdcard/unboxing"   

   adb shell settings put system screen_off_timeout 300000

   adb reverse tcp:8081 tcp:8081

   echo "starting app"
   adb shell am start -n com.unboxing/com.unboxing.MainActivity

cd ..