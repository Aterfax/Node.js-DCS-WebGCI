module.exports = {
    addOldTimestamp: function  (msg) {
        const { name, lat, lon, LastSeen, altitude } = msg;
        msg = { ...msg, name: name, lat: lat, lon: lon, PLastSeen: findOldTimestamp(name, LastSeen), Plat: findOldLat(name, lat), Plon: findOldLon(name, lon), Palt: findOldAlt(name, altitude) };
        return msg;
    },
    findOldTimestamp: function (sname, LastSeen) {
        let timestamp;
        if (ServerArray.find(x => x.name === sname) === undefined) {
            timestamp = LastSeen;
        } else {
            timestamp = ServerArray.find(x => x.name === sname).LastSeen;
        }
        return timestamp;
    },
    findOldLat: function (sname, lat) {
        let oldlat;
        if (ServerArray.find(x => x.name === sname) === undefined) {
            oldlat = lat;
        } else {
            oldlat = ServerArray.find(x => x.name === sname).lat;
        }
        return oldlat;
    },
    findOldLon: function (sname, lon) {   
        let oldlon;
        if (ServerArray.find(x => x.name === sname) === undefined) {
            oldlon = lon;
        } else {
            oldlon = ServerArray.find(x => x.name === sname).lon;
        }
        return oldlon;    
    },
    findOldAlt: function (sname, altitude) {
        let oldalt;
        if (ServerArray.find(x => x.name === sname) === undefined) {
            oldalt = altitude;
        } else {
            oldalt = ServerArray.find(x => x.name === sname).altitude;
        }
        return oldalt;
    },
};
 