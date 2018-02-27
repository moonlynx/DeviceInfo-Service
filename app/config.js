module.exports = {
    dbServer: "127.0.0.1",
    dbPort: "27017",
    dbName: "dbDeviceInfo",
    cDevices: "Devices",
    cDevicesUser: "readonly",
    cDevicesPass: "readonly",
    cCounters: "Counters",
    cCountersUser: "readwrite",
    cCountersPass: "readwrite",
    authDb: "admin", //mongodb auth collection
    scheduleTime: "0 10 0 * * *" // start every 00:10:00
};