// Simple launcher for the bundle
const uac = require("./wuac");
const { spawn } = require("child_process");
const { TOR_DIR } = require("../config");



// Proxy utility to reset/set proxy
const proxyutil = {
  set() {
    if (process.platform === "win32") {
      uac(`reg add ""HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"" /v ProxyEnable /t REG_DWORD /d 1 /f &&
 reg add ""HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"" /v ProxyServer /t REG_SZ /d socks=127.0.0.1:9050 /f`);
    } else {
      console.log("Please set your proxy settings manually, as support for this is only available for windows.");
    }
  },

  reset() {
    if (process.platform === "win32") {
      uac('reg add ""HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"" /v ProxyEnable /t REG_DWORD /d 0 /f');
    } else {
      console.log("Please set your proxy settings manually, as support for this is only available for windows.");
    }
  }
}



let tor, 
    exe = process.platform === "win32" ? `${TOR_DIR}/tor/tor.exe` : `${TOR_DIR}/tor/tor`;

module.exports = (ipc, data) => {
  function connect() {
    ipc.sender.send("status", `launching tor`);

    proxyutil.set();
    tor = spawn(exe, ["-f", `${TOR_DIR}/torrc`]);
    tor.stdout.on("data", (d) => {
      ipc.sender.send("status", d.toString());
    });

    ipc.sender.send("launch:done");
  }

  function disconnect() {
    ipc.sender.send("status", `terminating tor`);

    proxyutil.reset();
    tor.kill("SIGTERM");

    ipc.sender.send("status", `Disconnected @ ${new Date().toLocaleString()}.`);
    ipc.sender.send("launch:done");
  };


  if (data === 0) connect(); 
  if (data === 1) disconnect();
};