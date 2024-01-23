// getter/setter for torrc
const fs = require("fs");
const TORRC = `${ require("../config").TOR_DIR }/torrc`;


module.exports = (ipc, data) => {
  if (!data) {  // GET
    try {
      ipc.sender.send( "edit", fs.readFileSync(TORRC).toString() );
    } catch {
      ipc.sender.send("edit", false);
    };
  } else {      // SET
    try {
      fs.writeFileSync(TORRC, data);
      ipc.sender.send("edit", true);
    } catch {
      ipc.sender.send("edit", false);
    };
  }
};