/* global context, msg, node */

// ++++++++++++++++++++++++++++++ SETUP START ++++++++++++++++++++++++++++++
const host = 'pgaw.hoggitworld.com';
const port = '42674';
const servername = 'pgaw';
const connectionstring = 'XtraLib.Stream.0\nTacview.RealTimeTelemetry.0\nnodered_webgci\n0\0';
const delay = 1000; // delay in milliseconds

let timer = 0; // Start at zero
// ++++++++++++++++++++++++++++++ SETUP END ++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++ GENERAL FUNCTIONS START ++++++++++++++++++++++++++++++

function BufferToString (buffer) {
  return Buffer.from(buffer).toString();
}

function SplitOnNewLine (string) {
  string = string.split(/\r?\n/);
  return string;
}

function GetServerName (servername) {
  return servername || 'UNSET-SERVER-PLEASE-SET-SERVERNAME';
}

function GetArray (Original, Diff, sendglobal) {
  if (timer > 5000) {
    // node.log(timer);
    timer = 0;
    sendglobal = true;
  }
  timer += delay;

  const msg = {};
  // First update the main array
  Diff.forEach(obj => PushToArray(ServerArray, obj));

  // Check for whether we want to send a full update or just the diff.
  if (sendglobal) {
    msg.payload = Original;
  } else {
    msg.payload = Diff;
  }

  // Actually send the update
  node.send(msg);

  // Reset the sendglobal boolean
  global.set('sendglobal', false);

  // Delete the objects with the property deleted
  ServerArray = ServerArray.filter(el => !el.deleted);
  ServerArrayDiff = [];
}

function SendFullArray (ServerArray) {
  msg.payload = ServerArray;
  node.send(msg);
}

function ConvertAltitude (altitudeM) {
  let altitudeF = altitudeM * 3.2808;
  altitudeF = parseFloat(altitudeF) / 1000;
  altitudeF = altitudeF.toPrecision(3);
  return altitudeF;
}

function Distance (startLat, startLng, destLat, destLng, unit) {
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
}

function VelocityCalc (fdist, starttime, endtime) {
  const delta = (starttime - endtime);
  let velocity = fdist / delta;
  velocity = parseFloat(velocity);
  return velocity;
}

function SpeedCalc (name, lat, lon, starttime, plat, plon, endtime) {
  let fdist = Distance(plat, plon, lat, lon, 'N').toFixed(4);
  fdist = parseFloat(fdist);
  let velocityc = VelocityCalc(fdist, starttime, endtime);
  velocityc = 3600 * parseFloat(velocityc);
  velocityc = parseInt(velocityc.toPrecision(4));
  return velocityc;
}

function AddSpeed (msg) {
  const { name, lat, lon, LastSeen, PLastSeen, Plat, Plon, tooltip } = msg;
  msg = { ...msg, name: name, lat: lat, lon: lon, tooltip: tooltip + '<br> Speed: ' + SpeedCalc(name, lat, lon, LastSeen, Plat, Plon, PLastSeen) };
  return msg;
}

function ConvertDDToDMS (D, lng) {
  const dir = D < 0 ? lng ? 'W' : 'S' : lng ? 'E' : 'N';
  const deg = D | 0; // truncate dd to get degrees
  const frac = Math.abs(D - deg); // get fractional part
  const min = (frac * 60) | 0; // multiply fraction by 60 and truncate
  const sec = frac * 3600 - min * 60;
  return dir + ' ' + deg + ' M ' + min + ' S ' + sec.toPrecision(4);
}

// ++++++++++++++++++++++++++++++ GENERAL FUNCTIONS END ++++++++++++++++++++++++++++++
//
//
// ++++++++++++++++++++++++++++++ PAYLOAD PARSING FUNCTIONS START ++++++++++++++++++++++++++++++
function ConvertArguments (payload) {
  const tokens = payload.split('=');
  switch (tokens[0]) {
    case 'Type': msg.payload.Type = tokens[1]; break;
    case 'Name': msg.payload.Platform = tokens[1]; break;
    case 'Pilot': msg.payload.Pilot = tokens[1]; break;
    case 'Group': msg.payload.Group = tokens[1]; break;
    case 'Coalition': msg.payload.Coalition = tokens[1]; break;
    case 'Country': msg.payload.Country = tokens[1]; break;
  }
}

function ConvertTransform (payload) {
  payload = payload.substr(2);
  msg.payload.original = payload;
  const tokens = payload.split('|');
  msg.payload.LastSeen = Math.round((new Date()).getTime() / 1000);
  msg.payload.LatLongAlt = {};
  for (let i = 0; i < tokens.length; i++) {
    if ((tokens[i] != null) && (tokens[i] !== '') && (tokens.length === 5)) {
      switch (i) {
        case 0: msg.payload.lon = parseFloat(tokens[i]) + reflong; break;
        case 1: msg.payload.lat = parseFloat(tokens[i]) + reflat; break;
        case 2: msg.payload.alt = parseFloat(tokens[i]); break;
        case 3: msg.payload.U = parseFloat(tokens[i]); break;
        case 4: msg.payload.V = parseFloat(tokens[i]); break;
      }
    } else if ((tokens[i] != null) && (tokens[i] !== '')) {
      switch (i) {
        case 0: msg.payload.lon = parseFloat(tokens[i]) + reflong; break;
        case 1: msg.payload.lat = parseFloat(tokens[i]) + reflat; break;
        case 2: msg.payload.alt = parseFloat(tokens[i]); break;
        case 3: msg.payload.roll = parseFloat(tokens[i]); break;
        case 4: msg.payload.pitch = parseFloat(tokens[i]); break;
        case 5: msg.payload.yaw = parseFloat(tokens[i]); break;
        case 6: msg.payload.U = parseFloat(tokens[i]); break;
        case 7: msg.payload.V = parseFloat(tokens[i]); break;
        case 8: msg.payload.bearing = parseFloat(tokens[i]); break;
      }
    }
  }
}

// ++++++++++++++++++++++++++++++ PAYLOAD PARSING FUNCTIONS END ++++++++++++++++++++++++++++++
//
//
// ++++++++++++++++++++++++++++++ GLOBAL ARRAY PARSING FUNCTIONS START ++++++++++++++++++++++++++++++
function PushToArray (arr, obj) {
  const index = arr.findIndex((e) => e.name === obj.name);
  if (index === -1) {
    arr.push(obj);
  } else {
    Object.assign(arr[index], obj);
  }
  return arr;
}

function RemoveNonTypeEntities (arr) {
  const index = arr.findIndex((e) => e.Type == null);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

// ++++++++++++++++++++++++++++++ GLOBAL ARRAY PARSING FUNCTIONS END ++++++++++++++++++++++++++++++
//
//
// ++++++++++++++++++++++++++++++ ICON FUNCTIONS START ++++++++++++++++++++++++++++++
function SetIconAir (subtype) {
  let icon = 'unknown';
  switch (subtype) {
    case 'FixedWing': icon = 'plane'; break;
    case 'Rotorcraft': icon = 'helicopter'; break;
  }
  return icon;
}

function SetIconGround (subtype) {
  return 'fa-dot-circle-o fa-1';
}

function SetIconSea (subtype) {
  return 'ship';
}

function SetIconWeapon (subtype) {
  return 'unknown';
}

function SetIconSensor (subtype) {
  return 'unknown';
}

function SetIconNavaid (subtype) {
  return 'fa-bullseye';
}

function SetIconMisc (subtype) {
  return 'unknown';
}

function SetIcon (Type) {
  let icon = 'unknown';
  if (Type) {
    Type = Type.split('+');
    const maintype = Type[0];
    const subtype = Type[1];
    msg.payload.maintype = maintype;
    msg.payload.subtype = subtype;
    switch (maintype) {
      case 'Air': icon = SetIconAir(subtype); break;
      case 'Ground': icon = SetIconGround(subtype); break;
      case 'Sea': icon = SetIconSea(subtype); break;
      case 'Weapon': icon = SetIconWeapon(subtype); break;
      case 'Sensor': icon = SetIconSensor(subtype); break;
      case 'Navaid': icon = SetIconNavaid(subtype); break;
      case 'Misc': icon = SetIconMisc(subtype); break;
    }
  } else {
    icon = 'unknown';
  }
  return icon;
}
// ++++++++++++++++++++++++++++++ ICON FUNCTIONS END ++++++++++++++++++++++++++++++
//
//
// ++++++++++++++++++++++++++++++ LAYER FUNCTIONS START ++++++++++++++++++++++++++++++
function SetLayer (Type) {
  let layer = 'NoLayer';
  if (Type) {
    Type = Type.split('+');
    const maintype = Type[0];
    switch (maintype) {
      case 'Air': layer = 'Aircraft'; break;
      case 'Ground': layer = 'Ground Vehicles'; break;
      case 'Sea': layer = 'Seacraft'; break;
      case 'Weapon': layer = 'Weapons'; break;
      case 'Sensor': layer = 'Sensors'; break;
      case 'Navaid': layer = 'Navaids'; break;
      case 'Misc': layer = 'Misc'; break;
    }
  } else {
    layer = 'NoType';
  }
  return layer;
}

// ++++++++++++++++++++++++++++++ LAYER FUNCTIONS END ++++++++++++++++++++++++++++++
//
//
// ++++++++++++++++++++++++++++++ COALITION FUNCTIONS START ++++++++++++++++++++++++++++++
function SetColors (Coalition) {
  let color = '';
  if (Coalition) {
    switch (Coalition) {
      case 'Allies': color = '#ff8080'; break;
      case 'Enemies': color = '#80e0ff'; break;
      case 'Neutrals': color = '#00ff00'; break;
      case 'Unknown': color = '#FFFF00'; break;
    }
  } else {
    color = '#ffa500';
  }
  return color;
}
// ++++++++++++++++++++++++++++++ COALITION FUNCTIONS END ++++++++++++++++++++++++++++++
//
//
// ++++++++++++++++++++++++++++++ PLATFORM FUNCTIONS START ++++++++++++++++++++++++++++++
function PlatformOverrides (Platform, OverrideType, Icon, Layer, Radius, Side) {
  let value = '';
  if (OverrideType === 'Icon') {
    switch (Platform) {
      case 'FARP': value = 'wrench'; break;
      case 'Pilot': value = 'male'; break;
      case 'KC-135':
      case 'S-3B Tanker':
      case 'KC135MPRS': value = 'https://atwar.online/assets/images/icons/KC130-blue.png'; break;
    }
  } else if (OverrideType === 'Layer') {
    switch (Platform) {
      case 'FARP': value = 'Airports'; break;
      case 'Pilot': value = 'Parachutists'; break;
      case 'SA-18 Igla-S manpad': value = Side + 'SAMs'; break;
      case 'S-300PS 5P85D ln': value = Side + 'SAMs'; break;
      case 'S-300PS 5P85C ln': value = Side + 'SAMs'; break;
      case 'ZSU-23-4 Shilka': value = Side + 'SAMs'; break;
      case 'rapier_fsa_launcher':; value = Side + 'SAMs'; break;
      case 'Hawk ln': value = Side + 'SAMs'; break;
      case 'Kub 2P25 ln': value = Side + 'SAMs'; break;
      case 'S_75M_Volhov': value = Side + 'SAMs'; break;
      case 'Tor 9A331': value = Side + 'SAMs'; break;
      case 'Strela-10M3': value = Side + 'SAMs'; break;
      case '2S6 Tunguska': value = Side + 'SAMs'; break;
      case 'SA-11 Buk CC 9S470M1': value = Side + 'SAMs'; break;
      case 'M48 Chaparral': value = Side + 'SAMs'; break;
      case 'M1097 Avenger': value = Side + 'SAMs'; break;
      case 'Osa 9A33 ln': value = Side + 'SAMs'; break;
      case '5p73 s-125 ln': value = Side + 'SAMs'; break;
      case 'Strela-1 9P31': value = Side + 'SAMs'; break;
      case 'SA-18 Igla manpad': value = Side + 'SAMs'; break;
      case 'Igla manpad INS': value = Side + 'SAMs'; break;
      case 'Patriot ln': value = Side + 'SAMs'; break;
    }
  } else if (OverrideType === 'Radius') {
    switch (Platform) {
      case 'SA-18 Igla-S manpad': value = 5185; break;
      case 'S-300PS 5P85D ln': value = 74080; break;
      case 'S-300PS 5P85C ln': value = 74080; break;
      case 'ZSU-23-4 Shilka': value = 2407; break;
      case 'rapier_fsa_launcher': value = 7408; break;
      case 'Hawk ln': value = 44448; break;
      case 'Kub 2P25 ln': value = 24076; break;
      case 'S_75M_Volhov': value = 42596; break;
      case 'Tor 9A331': value = 12038; break;
      case 'Strela-10M3': value = 5185; break;
      case '2S6 Tunguska': value = 12038; break;
      case 'SA-11 Buk CC 9S470M1': value = 24076; break;
      case 'M48 Chaparral': value = 5556; break;
      case 'M1097 Avenger': value = 6852; break;
      case 'Osa 9A33 ln': value = 10000; break;
      case '5p73 s-125 ln': value = 18520; break;
      case 'Strela-1 9P31': value = 5185; break;
      case 'SA-18 Igla manpad': value = 5185; break;
      case 'Igla manpad INS': value = 5185; break;
      case 'Patriot ln': value = 100008; break;
    }
  }
  return value;
}
// ++++++++++++++++++++++++++++++ PLATFORM FUNCTIONS END ++++++++++++++++++++++++++++++
//
//
// ++++++++++++++++++++++++++++++ OLD DATA FUNCTIONS START ++++++++++++++++++++++++++++++
function addOldTimestamp (msg) {
  const { name, lat, lon, LastSeen, altitude } = msg;
  msg = { ...msg, name: name, lat: lat, lon: lon, PLastSeen: findOldTimestamp(name, LastSeen), Plat: findOldLat(name, lat), Plon: findOldLon(name, lon), Palt: findOldAlt(name, altitude) };
  return msg;
}

function findOldTimestamp (sname, LastSeen) {
  let timestamp;
  if (ServerArray.find(x => x.name === sname) === undefined) {
    timestamp = LastSeen;
  } else {
    timestamp = ServerArray.find(x => x.name === sname).LastSeen;
  }
  return timestamp;
}

function findOldLat (sname, lat) {
  let oldlat;
  if (ServerArray.find(x => x.name === sname) === undefined) {
    oldlat = lat;
  } else {
    oldlat = ServerArray.find(x => x.name === sname).lat;
  }
  return oldlat;
}

function findOldLon (sname, lon) {
  let oldlon;
  if (ServerArray.find(x => x.name === sname) === undefined) {
    oldlon = lon;
  } else {
    oldlon = ServerArray.find(x => x.name === sname).lon;
  }
  return oldlon;
}

function findOldAlt (sname, altitude) {
  let oldalt;
  if (ServerArray.find(x => x.name === sname) === undefined) {
    oldalt = altitude;
  } else {
    oldalt = ServerArray.find(x => x.name === sname).altitude;
  }
  return oldalt;
}
// ++++++++++++++++++++++++++++++ OLD DATA FUNCTIONS END ++++++++++++++++++++++++++++++
//
//
// ++++++++++++++++++++++++++++++ BUFFER PARSING START ++++++++++++++++++++++++++++++

// const { Transform } = require('stream');
const { Transform } = context.global.get('stream'); // NodeRed is not native node or javascript
const newLine = new Transform();

newLine._transform = function (chunk, encoding, callback) {
  let data = chunk.toString();
  if (this.lastLine) {
    data = this.lastLine + data;
  }

  const lines = data.split('\n');
  this.lastLine = lines.splice(lines.length - 1, 1)[0];
  lines.forEach(this.push.bind(this));
  callback();
};

newLine._flush = function (callback) {
  if (this.lastLine) {
    this.push(this.lastLine);
  }
  this.lastLine = '';
  callback();
};
// ++++++++++++++++++++++++++++++ BUFFER PARSING END ++++++++++++++++++++++++++++++
//
//
//
//
//
//
// ++++++++++++++++++++++++++++++ MAIN THREAD START ++++++++++++++++++++++++++++++

// Get the reference values to correct the offset for co-ordinates
let reflat = 0;
let reflong = 0;

// SetGlobal to send full array on start up
global.set('sendglobal', true);

// Start Connection logic
const net = context.global.get('net');
// var net = require('net')  //NodeRed is not native node or javascript

// Setup connection
const connection = new net.Socket();
let serverupdate;

// Define the server array
let ServerArray = [];
let ServerArrayDiff = [];

connection.connect(port, host, function () {
  connection.write(connectionstring);
  serverupdate = setInterval(() => { GetArray(ServerArray, ServerArrayDiff, global.get('sendglobal'), timer) }, delay);
});

// Setup buffer parsing fuckery
const parsed = connection.pipe(newLine);

parsed.on('data', function (data) {
  msg.payload = {};
  // Begin parsing of raw incoming messages
  let values = BufferToString(data);

  if (/^#.*/.test(values) || /^FileType/.test(values)) {
    return;
  }

  if (/^0,.*/.test(values)) {
    // node.log(values);
    if (/^0,ReferenceLatitude/.test(values)) {
      reflat = parseInt(values.match(/^0,ReferenceLatitude=(\d+)$/m)[1]);
    }
    if (/^0,ReferenceLongitude/.test(values)) {
      reflong = parseInt(values.match(/^0,ReferenceLongitude=(\d+)$/m)[1]);
    }
    return;
  }

  values = values.trim().split(','); // trim off the crlf first then split into parts

  if (/^-.*/.test(values[0])) {
    msg.payload.name = GetServerName(servername) + values[0].substring(1);
    msg.payload.deleted = true;
    // node.log("Item deleted.");
    // node.log(msg.payload.name);
  } else {
    msg.payload.name = GetServerName(servername) + values[0];
  }
  // Set the name of the object and the server name if defined from the Tacview ID
  node.log(values[1]);
  if (values[1]) { ConvertTransform(values[1]) } // Convert transform to actual discrete vars.
  values.slice(2, values.length).forEach(ConvertArguments); // Convert further arguments to discrete vars.

  // Convert altitude
  if (msg.payload.alt) {
    msg.payload.alt = ConvertAltitude(msg.payload.alt);
  }

  // Set Icons and Layer values
  if (msg.payload.Type) {
    msg.payload.icon = SetIcon(msg.payload.Type);
    msg.payload.layer = SetLayer(msg.payload.Type);
  }

  // Set Colors and side values
  if (msg.payload.Coalition) {
    msg.payload.iconColor = SetColors(msg.payload.Coalition);
    msg.payload.lineColor = SetColors(msg.payload.Coalition);
    msg.payload.fillColor = SetColors(msg.payload.Coalition);
    msg.payload.fillOpacity = 0.01; // Only want this set once.
    if (msg.payload.Coalition === 'Allies') { msg.payload.side = 'East' } // This is set for Platform overrides.
    if (msg.payload.Coalition === 'Enemies') { msg.payload.side = 'West' } // This is set also for Platform overrides.
  }

  // Begin any required Platform Overrides
  // if (msg.payload.Platform){
  // }

  // Add the speed if desired.
  // msg.payload = msg.payload(addOldTimestamp);
  // msg.payload = msg.payload.map(AddSpeed);

  // Convert Lat and Long Unit type and add D M S
  // msg.payload = msg.payload.map(({ lat, lon, ...rest }) => ({ dlat: ConvertDDToDMS(lat,0), dlon: ConvertDDToDMS(lon,1), lat, lon, ...rest }));

  delete msg.payload.LatLongAlt;

  PushToArray(ServerArrayDiff, msg.payload);
});

connection.on('close', function () {
  clearInterval(serverupdate);
});

// ++++++++++++++++++++++++++++++ MAIN THREAD END ++++++++++++++++++++++++++++++
