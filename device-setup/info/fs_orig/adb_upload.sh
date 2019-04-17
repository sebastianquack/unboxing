adb root

# wifi
adb push data/misc/wifi/WifiConfigStore.xml /data/misc/wifi/WifiConfigStore.xml
adb shell chown system:system /data/misc/wifi/WifiConfigStore.xml
adb shell chmod 600 /data/misc/wifi/WifiConfigStore.xml

# adb keys
adb push data/misc/adb/adb_keys /data/misc/adb/adb_keys
adb shell chown system:shell /data/misc/adb/adb_keys
adb shell chmod 640 /data/misc/adb/adb_keys

# user settings
adb push data/system/users/0 /data/system/users/0
adb shell chown -R system:system /data/system/users/0
adb shell chmod -R 600 /data/system/users/0/*
adb shell chmod 660 /data/system/users/0/package-restrictions.xml
adb shell chmod 700 /data/system/users/0/fpdata
adb shell chmod 771 /data/system/users/0/registered_services

# APNs
adb push data/user_de/0/com.android.providers.telephony/databases/telephony.db /data/user_de/0/com.android.providers.telephony/databases/telephony.db
adb shell chown radio:radio /data/user_de/0/com.android.providers.telephony/databases/telephony.db
adb shell chmod 660 /data/user_de/0/com.android.providers.telephony/databases/telephony.db

# probably good to reboot now