const dbConnector = require("../components/dbConnector"),
      formatError = require("./errorHelpers"),
      config = require("../config");

function getCountersCollection(serverInstance) {

    const db = serverInstance.db(config.dbName);
    
    return db.collection(config.cCounters);
}

function getDevicesCollection(serverInstance) {

    const db = serverInstance.db(config.dbName);
    
    return db.collection(config.cDevices);
}

function getFindResult(collection, query, projection) {

    return collection.find(query, {projection: projection});
}

function getDocumentToInsert(deviceId) {

    return {_id: deviceId};
}

function getFieldToUpdate(oidName, oidValue) {
    
    let date = new Date(),
        year = "" + date.getFullYear(),
        month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : "" + (date.getMonth() + 1)
        day = date.getDate() < 10 ? "0" + date.getDate() : "" + date.getDate(),
            
        document = {},
        key = "oids." + oidName + "." + year + "." + month + "." + day;

    document[key] = oidValue;
    
    return document;
}

function getDeviceObjects() {
    return  dbConnector.getServerInstance(config.cDevicesUser, config.cDevicesPass)
            .then(serverInstance => {

                const collection = getDevicesCollection(serverInstance),
                      projection = {_id: 1, ip: 1, oids: 1, comunity: 1};

                return  getFindResult(collection, {}, projection).toArray()
                        .then(result => {
                            serverInstance.close();
                            return result;
                        })
                        .catch(error => {
                            throw formatError("getFindResult", error);
                        });
            })
            .catch(error => {
                throw formatError("getDeviceObjects", error);
            });
}

function getDBOperations(collection, snmpObject) {

    return  getFindResult(collection, {_id: snmpObject.id}, {}).limit(1).count()
            .then(result => {
                let operations = [];

                if (result.length < 1) {
                    operations.push({insertOne: getDocumentToInsert(snmpObject.id)});
                }
                
                snmpObject.oidObjects.forEach(oid => {
                    operations.push({
                            updateOne: {
                                filter: {_id: snmpObject.id},
                                update: {$set: getFieldToUpdate(oid.name, oid.value)},
                                upsert: true
                            }
                    });
                });
                
                return operations;
            })
            .catch(error => {
                throw formatError("getFindResult", error);
            });
}

function getBulkWriteOperations(collection, snmpObjects) {

    let operationsPromises = snmpObjects.map(snmpObject => {
        return getDBOperations(collection, snmpObject);
    });

    return  Promise.all(operationsPromises)
            .then(result => {
                let operationsList = [];

                result.forEach(operations => {
                    operations.forEach(operation => {
                        operationsList.push(operation);
                    })
                })

                return operationsList;
            })
            .catch(error => {
                throw formatError("getBulkWriteOperations", error);
            });
}

function runCountersBulkWrite(snmpObjects) {
    
    return  dbConnector.getServerInstance(config.cDevicesUser, config.cDevicesPass)
            .then(serverInstance => {

                const collection = getCountersCollection(serverInstance),
                      operations = getBulkWriteOperations(collection, snmpObjects);

                return  getBulkWriteOperations(collection, snmpObjects)
                        .then(operations => {
                            return collection.bulkWrite(operations, {ordered: true})
                                   .then(result => {
                                        serverInstance.close();
                                        return result;
                                    });
                        })                        
                        .catch(error => {
                            throw formatError("countersBulkWriteOperations", error);
                            serverInstance.close();
                        });
            })
            .catch(error => {
                throw formatError("runCountersBulkWrite", error);
            });
}

module.exports.getDeviceObjects = getDeviceObjects;
module.exports.runCountersBulkWrite = runCountersBulkWrite;