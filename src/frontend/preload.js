const $=s=>document.querySelector(s);
Element.prototype.on = Element.prototype.addEventListener;

const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", ()=>{
  ipcRenderer.send("ready", true);
  
  ipcRenderer.on("status", (e, data) => {
    if (data === "Ready") onReady();
    $("footer").innerText = data;
  });
});



let connected = false;
function onReady() {
  $("#start").on("click", ()=>{
    if (!connected) {
      $("#start").innerText = "Connecting...";
      ipcRenderer.send("launch", 0); // 0=connect
    } else {
      $("#start").innerText = "Disconnecting...";
      ipcRenderer.send("launch", 1); // 1=disconnect
    }
  });


  ipcRenderer.on("launch:done", ()=>{
    connected = !connected;
    $("#start").innerText = connected ? "Disconnect" : "Connect";
  });
  ipcRenderer.on("launch:fail", ()=>{  // this never gets called
    connected = !connected;
    $("#start").innerText = connected ? "Connect" : "Disconnect";
  });
}