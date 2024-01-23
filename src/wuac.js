// util: windows thing to run cmd commands with elevated perms
const fs = require("fs");
const {spawnSync} = require("child_process");

module.exports = (command)=>{
  command = command.replace("\n", "");
  const cs = `
  set UAC = CreateObject("Shell.Application")
  UAC.ShellExecute "cmd", "/c ${command}", "", "runas", 0
  `;


  fs.writeFileSync(`elevate-tmp.vbs`, cs, "utf-8");
  const result = spawnSync("cscript", ["elevate-tmp.vbs"]);
  fs.unlinkSync("elevate-tmp.vbs");

  return result;
};