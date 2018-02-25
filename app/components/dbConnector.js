const client = require("mongodb").MongoClient,
      config = require("../config");

function getServerInstance(user, password) {
    const url = "mongodb://" + config.dbServer + ":" + config.dbPort,
          options = {
                reconnectTries: 3,
                authSource: config.authDb,
                auth: {
                    user: user,
                    password: password
                }
          }

    return client.connect(url, options);
}

module.exports.getServerInstance = getServerInstance;