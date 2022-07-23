var array_parsing_functions = require('./functions_array_parsing.js');

module.exports = {
    BufferToString: function (buffer) {
        return Buffer.from(buffer).toString();
    },
    SplitOnNewLine: function (string) {
        string = string.split(/\r?\n/);
        return string;
    },
    GetServerName: function (servername) {
        return servername || 'UNSET-SERVER-PLEASE-SET-SERVERNAME';
    },

    GetArray: function (server, sendglobal, timer, delay, conn, servername) {

        timer.value++;
        //console.log(timer.value);

        // Reset the sendglobal boolean
        sendglobal = false;     
        if (timer.value === 10){
            sendglobal = true;
            timer.value = 0;
        }
        //console.log(sendglobal);
        //const msg = {};
        // First update the main array
        const serverarray = Object.values(server.serverarray);
        const serverarraydiff = serverarray.filter(el => el.time >= server.time);

        // Check for whether we want to send a full update or just the diff.
        if (sendglobal) {
            console.log(`Server:${servername} Sending full array of ${serverarray.length} unit(s)`);
            message = JSON.stringify(serverarray);
            //console.log("Sending Full array," + servername + " array length is:");
            //console.log(serverarray.length);
        } else {
            console.log(`Server:${servername} Sending partial array of ${serverarraydiff.length} unit(s)`);
            message = JSON.stringify(serverarraydiff);
            //console.log("Sending Diff array");

        }

        //console.log("Server:" + servername + " timestep happened. - Object count: " + serverarray.length);
        //console.log(message.length);
        conn.write(message);

        // Reset the sendglobal boolean
        sendglobal=false;

        //serverarraydiff = [];

        let deleteCount = 0;
        for (const [k, v] of Object.entries(server.serverarray)) {
            if (v.deleted) {
                delete server.serverarray[k];
                deleteCount++;
            }
        }

        if (deleteCount > 0) {
            console.log(`Server:${servername} Removing ${deleteCount} dead unit(s) from array`);
        }

        server.time = server.timediff

        // Delete the objects with the property deleted
    },
    ConvertAltitude: function (altitudeM) {
        let altitudeF = altitudeM * 3.2808;
        altitudeF = parseFloat(altitudeF); // 1000 division not needed for Cesium JS;
        altitudeF = altitudeF.toPrecision(3);
        return altitudeM;
    },
    Distance: function (startLat, startLng, destLat, destLng, unit) {
        if ((startLat === destLat) && (startLng === destLng)) {
            return 0;
        } else {
            const radlat1 = Math.PI * startLat / 180;
            const radlat2 = Math.PI * destLat / 180;
            const theta = startLng - destLng;
            const radtheta = Math.PI * theta / 180;
            let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
              dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit === 'K') { dist = dist * 1.609344 }
            if (unit === 'N') { dist = dist * 0.8684 }
            return dist;
        }
    },
    VelocityCalc: function (fdist, starttime, endtime) {
        const delta = (starttime - endtime);
        let velocity = fdist / delta;
        velocity = parseFloat(velocity);
        return velocity;
    },  
    SpeedCalc: function (name, lat, lon, starttime, plat, plon, endtime) {
        let fdist = Distance(plat, plon, lat, lon, 'N').toFixed(4);
        fdist = parseFloat(fdist);
        let velocityc = VelocityCalc(fdist, starttime, endtime);
        velocityc = 3600 * parseFloat(velocityc);
        velocityc = parseInt(velocityc.toPrecision(4));
        return velocityc;
    },
    AddSpeed: function (msg) {
        const { name, lat, lon, LastSeen, PLastSeen, Plat, Plon, tooltip } = msg;
        msg = { ...msg, name: name, lat: lat, lon: lon, tooltip: tooltip + '<br> Speed: ' + SpeedCalc(name, lat, lon, LastSeen, Plat, Plon, PLastSeen) };
        return msg;
    },
    ConvertDDToDMS: function (D, lng) {
        const dir = D < 0 ? lng ? 'W' : 'S' : lng ? 'E' : 'N';
        const deg = D | 0; // truncate dd to get degrees
        const frac = Math.abs(D - deg); // get fractional part
        const min = (frac * 60) | 0; // multiply fraction by 60 and truncate
        const sec = frac * 3600 - min * 60;
        return dir + ' ' + deg + ' M ' + min + ' S ' + sec.toPrecision(4);
    }
};
