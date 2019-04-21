# Unboxing Raspberry

## services

- wifi: unboxing
- psk: 87542000

- static ip: 192.168.8.1
- dhcp: range 192.168.8.50 - 192.168.8.99
- forwards ethernet connection
- forwards builtin wifi connection (set with bin/set_wpa)

- unboxing relay on port 3005
- unboxing server on port 3000

- username: pi 
- password: 87542

## Setup as complete server with a wifi dongle

1. install image (rpi-unboxing-v2.dmg) with Etcher
2. boot and connect via ethernet (dhcp) or modify `/boot/wpa_supplicant.config.example`
3. find hostname <host> of raspberry, e.g. 192.168.8.1
4. (optional) install your public key: `bin/install_pub_key <host>` 
5. set wifi device and ap ssid: `bin/set_ap_wifi_interface <host> wlan1 <ssid>`
6. (optional) set hostname: `bin/set_hostname <host> <hostname>`
7. (optional) setup wifi credentials of local wifi to connect: `bin/set_wpa <host> <ssid> <psk>`
8. (optional) enable hardware clock: `bin/enable_hwclock <host>`
9. reboot: `bin/reboot <host>`
10. update relay and server: `bin/deploy-server <host>`, `bin/deploy-relay <host>`

### check operation

`ssh pi@host /home/pi/status`
or use `mmon`

## setup as simple relay without dongle and internet

1. (same as above)
2. (same as above)
3. (same as above)
4. (same as above)
5. set hostapd to builtin wifi interface: `bin/set_ap_wifi_interface <host> wlan0`
6. (same as above)
7. (not necessary)

8. disable unboxing-server: `ssh pi@<host> sudo systemctl disable unboxing-server`
9. disable mongo: `ssh pi@<host> sudo systemctl disable mongodb`

10. reboot: `bin/reboot <host>`
11. update relay `bin/deploy-relay <host>`

## reset changes

`bin/reset_changes <host>`

## update server and relay

`bin/deploy-server <host>`
`bin/deploy-relay <host>`