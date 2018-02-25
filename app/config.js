module.exports = {
    dbServer: "127.0.0.1",
    dbPort: "27017",
    dbName: "<mongodb database name>",
    cDevices: "<Devices collection>",
    cDevicesUser: "<readonly user>",
    cDevicesPass: "<readonly password>",
    cCounters: "<oid values collection>",
    cCountersUser: "readWrite user",
    cCountersPass: "readWrite password",
    authDb: "admin", //mongodb auth collection
    scheduleTime: "0 10 0 * * *" // start every 00:10:00
};