const   schedule = require("node-schedule"),
        config = require("./config"),
        dbHelpers = require("./helpers/dbHelpers"),
        snmpHelpers = require("./helpers/snmpHelpers"),
        formatError = require("./helpers/errorHelpers");

function displayResult(result) {
    result.forEach((snmpItem) => {
        snmpItem.oidObjects.forEach((oid) => {
            if (oid.value instanceof Error) {
                console.log(snmpItem.ip + " : " + oid.name + " : " + oid.value.toString());
                    
            } else {
                console.log(snmpItem.ip + " : " + oid.name + " : " + oid.value);
            }
        });        
    });   
}

schedule.scheduleJob(config.scheduleTime, () => {
    
    dbHelpers.getDeviceObjects()
    .then(snmpHelpers.getSnmpResultObjects)
    .then(dbHelpers.runCountersBulkWrite)
    .then(result => {
        let message = "Результат:\n" +
                      "     Проверено записей: " + result.matchedCount + "\n" +
                      "     Добавлено записей: " + result.insertedCount + "\n" +
                      "     Модифицировано записей: " + result.modifiedCount + "\n";

        console.info(message);
    })
    .catch(error => {
        throw formatError("Service Error", error);
    });

});