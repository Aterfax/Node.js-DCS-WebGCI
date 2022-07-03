# Node.js-DCS-WebGCI

What is this?
-------------

A WebGCI (3D display of a live DCS server) using Node.JS. This works by parsing Tacview ACMI output into a web browser viewable map using Cesium JS (for now.)

![Screenshot 1](/screenshots/ss1.png?raw=true "Screenshot 1")
![Screenshot 2](/screenshots/ss2.png?raw=true "Screenshot 2")

Further screenshots are available in the screenshots directory.

How to start
------------

Run the server with ``node main.js`` then open http://localhost:8081/index.html?serverid=0

Servers are defined in ``servers.json`` for which the defaults are:

* Hoggit PGAW - serverid=0
* Hoggit GAW - serverid=1
* Hoggit SAW - serverid=2



Adjust settings in main.js
--------------------------

* Adjust the timing interval with the ``delay`` variable line 10.
* Changing the web port with the ``webserverport`` variable  line 12.
