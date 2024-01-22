// Launches/controls the bundle
const exe = process.platform === "win32" ? "tor-bundle/tor/tor.exe" : "tor-bundle/tor/tor";
const { spawn } = require("child_process");


// Proxy utility to reset/set proxy
const proxyutil = {
  set() {
    if (process.platform === "win32") {
      const run = require("./elevate");
      run(`reg add ""HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"" /v ProxyEnable /t REG_DWORD /d 1 /f &&
 reg add ""HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"" /v ProxyServer /t REG_SZ /d socks=127.0.0.1:9050 /f`);
    } else {
      console.log("Please set your proxy settings manually, as support is only available for windows for now.");
    }
  },
  reset() {
    if (process.platform === "win32") {
      const run = require("./elevate");
      run('reg add ""HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"" /v ProxyEnable /t REG_DWORD /d 0 /f');
    } else {
      console.log("Please set your proxy settings manually, as support is only available for windows for now.");
    }
  }
}




let tor;
module.exports = (ipc, data) => {
  async function connect() {
    ipc.sender.send("status", `launching tor`);
    proxyutil.set();

    tor = spawn(exe, ["-f", `${__dirname}/../tor-bundle/torrc`]); // dumb patch to fix the torrc not working
    tor.stdout.on("data", (d) => {
      ipc.sender.send("status", d.toString());
    });
    ipc.sender.send("launch:done");


    /*tor.on("close", (code)=>{
      ipc.sender.send("status", `Process closed with code ${code}`);
      ipc.sender.send("launch:fail");
    });*/
  }

  async function disconnect() {
    ipc.sender.send("status", `terminating tor`);
    proxyutil.reset();
    
    tor.kill("SIGTERM");
    ipc.sender.send("status", `Disconnected @ ${new Date().toLocaleString()}.`);
    ipc.sender.send("launch:done");
  };


  if (data === 0) connect(); 
  if (data === 1) disconnect();
};