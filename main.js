const {app, BrowserWindow, ipcMain} = require('electron');

function init() {
  const w = new BrowserWindow({
    width: 350,
    height: 700,
    autoHideMenuBar: true,
    webPreferences: {
      preload: `${__dirname}/src/frontend/preload.js`
    }
  });

  w.loadFile("src/frontend/index.html");

  //w.setMenu(null);
  //w.webContents.openDevTools();
}


// listeners
ipcMain.once("ready", require("./src/download"));
ipcMain.on("launch", require("./src/launch"));



app.on("ready", ()=>{
  init();

  app.on("activate", ()=>{
    if (BrowserWindow.getAllWindows().length === 0) init()
  });
});

app.on("window-all-closed", ()=>{
  if (process.platform !== "darwin") app.quit();
});