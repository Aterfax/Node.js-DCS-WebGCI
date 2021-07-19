// ++++++++++++++++++++++++++++++ IMPORT MODULES START ++++++++++++++++++++++++++++++
var http = require('http');
var sockjs = require('sockjs');
var node_static = require('node-static');
var net = require('net');
// ++++++++++++++++++++++++++++++ IMPORT MODULES END ++++++++++++++++++++++++++++++++
//
// ++++++++++++++++++++++++++++++ SETUP START ++++++++++++++++++++++++++++++
const connectionstring = 'XtraLib.Stream.0\nTacview.RealTimeTelemetry.0\nnodered_webgci\n0\0';
const delay = 1000; // delay in milliseconds
let timer = 0; // Start at zero
const webserverport = '8081';
var servers = require("./servers.json")

// ++++++++++++++++++++++++++++++ SETUP END ++++++++++++++++++++++++++++++
//
// ++++++++++++++++++++++++++++++ IMPORT FUNCTIONS START ++++++++++++++++++++++++++++++
var payload_parsing_functions = require('./functions/functions_payload_parsing.js');
var array_parsing_functions = require('./functions/functions_array_parsing.js');
var general_functions = require('./functions/functions_general.js');
var icon_functions = require('./functions/functions_icon.js');
var layer_functions = require('./functions/functions_layers.js');
var coalition_functions = require('./functions/functions_coalition.js');
var platform_functions = require('./functions/functions_platforms.js');
var old_data_functions = require('./functions/functions_old_data.js');
// ++++++++++++++++++++++++++++++++ IMPORT FUNCTIONS END ++++++++++++++++++++++++++++++
//
// ++++++++++++++++++++++++++++++ BUFFER PARSING START ++++++++++++++++++++++++++++++
const { Transform } = require('stream');
//const { Transform } = context.global.get('stream'); // NodeRed is not native node or javascript
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
// ++++++++++++++++++++++++++++++ MAIN THREAD START ++++++++++++++++++++++++++++++

// Start the webserver
var static_directory = new node_static.Server(__dirname);
var server = http.createServer();
server.addListener('request', function(req, res) {
    static_directory.serve(req, res);
});
server.addListener('upgrade', function(req,res){
    res.end();
});
console.log(' [*] Listening on 0.0.0.0:' + webserverport );
server.listen(webserverport, '0.0.0.0');



// Iterative for each server in servers.json
console.log("Starting socket connections to Tacview.");

servers.forEach((i) => {
  const host = i.url;
  const port = i.port;
  const servername = i.servername;
  const serverid = i.id;
  console.log("Tacview socket opened for: " + i.servername);

  // Setup connection
  const connection = new net.Socket();
  let serverupdate;

  // SetGlobal to send full array on start up
  sendglobal=true;

  var setOnce = false;
  // Start connecting
  connection.connect(port, host, function () {
    connection.write(connectionstring);

    // Start the Tacview sockets
    var sockjs_echo = sockjs.createServer();
    sockjs_echo.on('connection', function(conn) {
        console.log('connection start' + ",source " + conn.remoteAddress + ":" + conn.remotePort + ",URL " + conn.url);
        if (!setOnce) {
        serverupdate = setInterval(() => { general_functions.GetArray(i.serverarray, i.serverarraydiff, sendglobal, timer, delay, conn, servername) }, delay);
        setOnce = true;
        }

        conn.on('close', function() {
          console.log('close ' + conn.remoteAddress + ":" + conn.remotePort );
        });
    });

    sockjs_echo.installHandlers(server, {prefix:'/' + serverid});

  // Console will print the message
  console.log('Server running.');
  });

  // Setup buffer parsing fuckery
  const parsed = connection.pipe(newLine);
  //const fs = require('fs');

  parsed.on('data', function (data) {
    item = {};
    // Begin parsing of raw incoming messages
    let values = general_functions.BufferToString(data);
    //console.log(values);
    
    // fs.appendFile("./test.txt", JSON.stringify(values), function(err) {
    //     if(err) {
    //         return console.log(err);
    //     }
    // }); 
    
    // Strip out #TIMESTAMPS FILE indicators and anything starting with capitals or backslashes.
    if (/^#.*/.test(values) || /^[A-Z\\]/.test(values) ) {
      return;
    }

    // Strip out random lines starting with NULL which we do not want.
    if (/\u0000.*/.test(values)) {
      return;
    }
    
    // Grab the reference (offset) values for long and lat values.
    if (/^0,.*/.test(values)) {
      if (/^0,ReferenceLatitude/.test(values)) {
        reflat = parseInt(values.match(/^0,ReferenceLatitude=(\d+)$/m)[1]);
      }
      if (/^0,ReferenceLongitude/.test(values)) {
        reflong = parseInt(values.match(/^0,ReferenceLongitude=(\d+)$/m)[1]);
      }
      return;
    }
    // Trim off the crlf first then split into parts
    values = values.trim().split(',');

    // Add the deleted property if Tacview marks an object as dead with a hyphen at the start of the ID then set the name from ID.
    if (/^-.*/.test(values[0])) {
      item.name = general_functions.GetServerName(servername) + "-" + values[0].substring(1);
      item.deleted = true;
    } else {
      item.name = general_functions.GetServerName(servername) + "-" + values[0];
    }
    // Convert transform to actual discrete vars.
    if (values[1]) { payload_parsing_functions.ConvertTransform(values[1]) }

    // Convert further arguments into discrete vars / item properties. 
    values.slice(2, values.length).forEach(payload_parsing_functions.ConvertArguments); 

    // Convert altitude
    if (item.alt) {
      item.alt = general_functions.ConvertAltitude(item.alt);
      item.height = item.alt;
    }

    // Fix Bearing
    if (item.bearing){
      item.hdg = item.bearing;
    }

    // Set icons and layer values
    if (item.Type) {
      item.icon = icon_functions.SetIcon(item.Type);
      item.layer = layer_functions.SetLayer(item.Type);
    }

    // Set colors and side values
    if (item.Coalition) {
      item.iconColor = coalition_functions.SetColors(item.Coalition);
      item.lineColor = coalition_functions.SetColors(item.Coalition);
      item.fillColor = coalition_functions.SetColors(item.Coalition);
      item.fillOpacity = 0.01; // Only want this set once.
      if (item.Coalition === 'Allies') { item.side = 'East' } // This is set for Platform overrides.
      if (item.Coalition === 'Enemies') { item.side = 'West' } // This is set also for Platform overrides.
    }

    // Begin any required Platform Overrides
    //if (item.Platform){
    //}

    // Add the speed if desired.
    //item = item(addOldTimestamp);
    //item = item.map(general_functions.AddSpeed);

    // Convert Lat and Long Unit type and add D M S
    //item = item.map(({ lat, lon, ...rest }) => ({ dlat: general_functions.ConvertDDToDMS(lat,0), dlon: general_functions.ConvertDDToDMS(lon,1), lat, lon, ...rest }));
  if (item.Type){
    if (item.Type.includes("Parachutist")){
      return;
    }
  }
    //console.log(item);
    array_parsing_functions.PushToArray(i.serverarraydiff, item);
  });

});
// ++++++++++++++++++++++++++++++ MAIN THREAD END ++++++++++++++++++++++++++++++