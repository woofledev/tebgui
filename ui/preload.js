const $=s=>document.querySelector(s); Element.prototype.on = Element.prototype.addEventListener;


const { ipcRenderer } = require("electron");
window.onload = (e)=>{
  ipcRenderer.send("ready"); // ready, start download.
  
  ipcRenderer.on("status", (e, data) => {
    if (data === "Ready") onReady();
    $("footer").innerText = data;
    $("#eventlog").value +=  `[${new Date().toLocaleString()}] ${data}\n`;
  });
};



let connected = false;
function onReady() {
  // starting stuff
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
  ipcRenderer.on("launch:fail", ()=>{
    connected = !connected;
    $("#start").innerText = connected ? "Disconnect" : "Connect";
  });


  // config file editor
  ipcRenderer.send("edit");
  ipcRenderer.on("edit", (e, data)=>{
    if (typeof data == "string") {
      // GET, load into the config textarea
      $("#config").value = data;
    } else {
      $("#eventlog").value += `[${new Date().toLocaleString()}] {edit event} returned value: ${data}\n`;
    };
  });
  $("#config-save").on("click", ()=>{
    ipcRenderer.send("edit", $("#config").value);
  });
}