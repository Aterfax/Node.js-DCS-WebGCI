# Node.js-DCS-WebGCI
A WebGCI based on Node.JS which parses Tacview ACMI output into a web browser viewable map using Cesium JS (for now.)


How to start
------------

Run the server with ``node main.js`` then open http://localhost:8081/index3dcesium.html

Adjust settings in main.js
--------------------------

* Adjust the timing interval with the ``delay`` variable line 13.
* Changing the web port with the ``webserverport`` variable  line 15.
