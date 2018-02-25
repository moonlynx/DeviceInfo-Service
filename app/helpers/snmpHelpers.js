const snmpConnector = require("../components/snmpConnector"),
      formatError = require("./errorHelpers"),
      snmp = require("net-snmp");

const SNMP_GET_ERROR = "SNMP error",
      UNKNOWN_OID_ERROR = "Unknown OID name";

function getOIDErrorValue(deviceIp, deviceOids, error) {

    console.error(
        "\n" +
        "   SNMP ERROR on Device: " + deviceIp + "\n" +
        "   Device OIDs: " + deviceOids + "\n" +
        "   Error: " + error
    );

    return SNMP_GET_ERROR;
}

function SNMPResultObject(id, ip) {
    this.id = id,
    this.ip = ip,
    this.oidObjects = []
}

function OIDResultObject(name, oid, value) {
    this.name = name,
    this.oid = oid,
    this.value = value
}

function getOIDName(dbOidsObject, oid) {
    for (key in dbOidsObject) {
        if (dbOidsObject[key] == oid) {
            return key;
        }
    }

    return UNKNOWN_OID_ERROR;
}

function getOIDsList(dbOidsObject) {
    let result = [];

    for (key in dbOidsObject) {
        result.push(dbOidsObject[key]);
    }

    return result;
}

function createSnmpResultObject(device) {

    let session = snmpConnector.getSNMPSession(device.ip, device.comunity),
        snmpResultObject = new SNMPResultObject(device._id, device.ip),
        oidsList = getOIDsList(device.oids);


    return new Promise((resolve) => {
                
        session.get(oidsList, function (error, varbinds) {

            if (error) {
                let oidErrorValue = getOIDErrorValue(device.ip, oidsList, error);

                oidsList.forEach(oid => {
                    let oidName = getOIDName(device.oids, oid);

                    snmpResultObject.oidObjects.push(new OIDResultObject(oidName, oid, oidErrorValue));
                });              
    
            } else {
                for (var i = 0; i < varbinds.length; i++) {
                    let oidName = getOIDName(device.oids, varbinds[i].oid);
                       
                    if (snmp.isVarbindError (varbinds[i])) {
                        snmpResultObject.oidObjects.push(new OIDResultObject(oidName, varbinds[i].oid, snmp.varbindError (varbinds[i])));
                        
                    } else {
                        snmpResultObject.oidObjects.push(new OIDResultObject(oidName, varbinds[i].oid, varbinds[i].value));
                    }
                }            
            }
    
            session.close();
                
            resolve(snmpResultObject);
        }); 
    });             
};

function getSnmpResultObjects(deviceObjects) {

    let snmpDevices = deviceObjects.filter((device) => {
            return  (typeof(device.oids) != "undefined") &&
                    (typeof(device.ip) != "undefined");
    });

    let counterSNMPPromises = snmpDevices.map((device) => {
            return createSnmpResultObject(device);
    });

    return Promise.all(counterSNMPPromises);
}

module.exports.getSnmpResultObjects = getSnmpResultObjects;