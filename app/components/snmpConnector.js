const snmp = require("net-snmp");

module.exports.getSNMPSession = function (ip, community) {
    return snmp.createSession(ip, community);
}