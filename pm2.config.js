module.exports = {
  apps : [{
    name   : "DeviceInfo-Service",
    script : "./app/service.js",
    log_date_format: "DD-MM-YYYY HH:mm:ss",
    error_file: "./logs/service_error.log",
    out_file: "./logs/service.log",
    merge_logs: true   
  }]
}
