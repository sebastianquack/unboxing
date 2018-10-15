var zeroconf = require('bonjour')()

var os = require('os');
var ifaces = os.networkInterfaces();

var ipAddress = "";

Object.keys(ifaces).reverse().forEach(function (ifname) { // reverse to give enX priority over bridgeX (hack)
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log(ifname, iface.address);
      ipAddress = iface.address;
    }
    ++alias;
  });
});

// en0 192.168.1.101
// eth0 10.0.0.101

let name = "unboxing_" + ipAddress.replace(/\./g,"_");
console.log(name);
 
// or give it a custom name and configuration details
zeroconf.publish({ type: 'http', protocol: 'tcp', port: 3000, name, txt: {foo: "bar"}});