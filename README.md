# DeviceInfo-Service

1. [Описание](#Описание)
2. [Системные требования](#Системные-требования)
3. [Параллельные проекты](#Параллельные-проекты)
4. [Схема БД](#Схема-БД)
    - [Коллекция устройств](#Коллекция-устройств)
        - [Формат документа](#Формат-документа)
        - [Пример документа](#Пример-документа)
    - [Коллекция значений](#Коллекция-значений)
        - [Формат документа](#Формат-документа-значений)
        - [Пример документа](#Пример-документа-значений)
5. [Файл конфигурации](#Файл-конфигурации)
6. [Установка](#Установка)
7. [Управление](#Управление)

## <a name="Описание">Описание</a>

Позволяет собирать статистику с устройств по SNMPv1 и SNMPv2c в определенное время

## <a name="Системные-требования">Системные требования</a>

- nodejs

## <a name="Параллельные-проекты">Параллельные проекты</a>

Возможно использовать совместно с:
- [DeviceInfo-API](https://github.com/moonlynx/DeviceInfo-API)

## <a name="Схема-БД">Схема БД</a>

### <a name="Коллекция-устройств">Коллекция устройств</a>

Хранит документы с информацией об устройствах

Имя коллекции с документами устройств задается в '/app/config.js' в поле 'cDevices'

#### <a name="Формат-документа">Формат документа</a>

```
    {
        id: <Идентификатор устройства>,
        name: <имя устройства>
        ip: <ip адрес устройства>
        oids: {
            <имя объекта>: <номер объекта>, // имя объекта имеет произвольный формат, соответствующий
            <имя объекта>: <номер объекта>  // требованию к ключам mongodb
        }
        comunity: <readonly comunity устройства>
    }
```
**[требование к ключам](https://docs.mongodb.com/v3.6/core/document/#document-structure)** mongodb

#### <a name="Пример-документа">Пример документа</a>

```
    {
        id: <Идентификатор устройства>,
        name: "HP LaseJet 9050n"
        ip: <ip адрес устройства>
        oids: {
            totalPrintPages: "1.3.6.1.2.1.43.10.2.1.4.1.1"
        }
        comunity: "public"
    }
```
### <a name="Коллекция-значений">Коллекция значений</a>

Хранит собранные по SNMP значения заданных OID устройств, разбитые по датам. Заполняется программно.

Имя коллекции с документами значений задается в '/app/config.js' в поле 'cCounters'

#### <a name="Формат-документа-значений">Формат документа</a>

```
    {
        id: <идентификатор устройства>,
        <имя объекта>: {  
            <год>:{
                <месяц>:{
                    <день>: <значение>,
                    <день>: <значение>                        
                }
            }
        }
    }
```

- id аналогичен id устройства в коллекции устройств
- <имя объекта> аналогично имени каждого объекта в поле oids документа устройства

#### <a name="Пример-документа-значений">Пример документа</a>

```
    {
        id: <идентификатор устройства>,
        totalPrintPages: {  
            "2018":{
                "02":{
                    "01": 40050,
                    "02": 40055                        
                }
            }
        }
    }
```

## <a name="Файл-конфигурации">Файл конфигурации</a>

```
    // в следующих полях задаются адрес и порт сервера mongodb
    dbServer: "127.0.0.1",
    dbPort: "27017",
    dbName: "dbDeviceInfo", // имя базы данных проекта
    cDevices: "Devices", // имя коллекции устройств
    cDevicesUser: "readonly", // имя пользователя для чтения коллекции устройств
    cDevicesPass: "readonly", // пароль пользователя для чтения коллекции устройств
    cCounters: "Counters", // имя коллекции значений
    cCountersUser: "readwrite", // имя пользователя для записи в коллекцию значений
    cCountersPass: "readwrite", // пароль пользователя для записи в коллекцию значений
    authDb: "admin", // имя коллекции для аутентификации пользователей 
    scheduleTime: "0 10 0 * * *" // время опроса устройств в формате cron
```

[Формат времени планировщика](https://github.com/node-schedule/node-schedule)

## <a name="Установка">Установка</a>

1. скачать [архив](https://github.com/moonlynx/DeviceInfo-Service/blob/master/distr/DeviceInfo-Service.zip)
2. распаковать
3. в терминале перейти в папку с проектом: `cd <path/to/DeviceInfo-Service>`
4. установить pm2 pm2-logs и pm2-logrotate глобально: `npm -g install pm2 pm2-logs pm2-logrotate`
5. установить проект: `npm install`

## <a name="Управление">Управление</a>

- запуск проекта: 'npm start'
- перезапуск проекта: 'npm restart'
- остановка проекта: 'npm stop'