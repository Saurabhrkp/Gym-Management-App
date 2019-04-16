var app = require("electron").app;
var Window = require("electron").BrowserWindow; // jshint ignore:line
var Tray = require("electron").Tray; // jshint ignore:line
var fs = require("fs");

var server = require("./app");

var mainWindow = null;

app.on("ready", function() {
  "use strict";

  var path = require("path");
  var iconPath = path.resolve(__dirname, "./public/icon/Slack.ico");
  var config = require(path.join(__dirname, 'package.json'));
  const appIcon = new Tray(iconPath);
  app.setName(config.productName)
  mainWindow = new Window({
    width: 1280,
    height: 1024,
    autoHideMenuBar: false,
    useContentSize: true,
    resizable: true,
    icon: iconPath
    //  'node-integration': false // otherwise various client-side things may break
  });
  appIcon.setToolTip("My Cool App");
  mainWindow.loadURL("http://localhost:3000/");

  mainWindow.focus();
});

// shut down all parts to app after windows all closed.
app.on("window-all-closed", function() {
  "use strict";
  app.quit();
});
