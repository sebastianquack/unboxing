# Unboxing Raspberry

## services

- wifi: unboxing
- static ip: 192.168.8.1
- dhcp: range 192.168.8.50 - 192.168.8.99
- forwards ethernet connection
- forwards builtin wifi connection (set with bin/set_wpa)

- unboxing relay on port 3005
- unboxing server on port 3000

## Setup as complete server with a wifi dongle

1. install image (rpi-unboxing-v1.dmg) with Etcher
2. boot and connect via ethernet (dhcp) or modify `/boot/wpa_supplicant.config.example`-> find hostname of raspberry, e.g. 192.168.8.1
3. install your public key: `bin/install_pub_key <host>`
4. (if necessary) get device names with `ssh pi@<host> sudo ifconfig`
5. set ethernet device: `bin/set_ap_eth_interface <host> enx??????????`
6. set wifi dongle device: `bin/set_ap_wifi_interface <host> wlx??????????`
7. (optional) set hostname: `bin/set_hostname <host> <hostname>`
8. (if necessary) change access point ssid: `bin/set_ap_ssid <host> <ssid>` (default: unboxing/87542000)
9. (optional) setup wifi credentials of local wifi to connect: `bin/set_wpa <host> <ssid> <psk>`
10. reboot: `bin/reboot <host>`
11. update relay and server: `bin/deploy-server <host>`, `bin/deploy-relay <host>`

### check operation

`ssh pi@host /home/pi/status`
or use `mmon`

## setup as simple relay without dongle and internet

1. (same as above)
2. (same as above)
3. (same as above)
4. (same as above)
5. (same as above)
6. set hostapd to builtin wifi interface: `bin/set_ap_wifi_interface <host> wlan0`
7. (same as above)
8. (same as above)
9. (not necessary)

10. disable unboxing-server: `ssh pi@<host> sudo systemctl disable unboxing-server`
11. disable mongo: `ssh pi@<host> sudo systemctl disable mongodb`

12. reboot: `bin/reboot <host>`
13. update relay `bin/deploy-relay <host>`

## reset changes

`bin/reset_changes <host>`

## update server and relay

`bin/deploy-server <host>`
`bin/deploy-relay <host>`