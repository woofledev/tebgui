// Downloads/sets up the tor expert bundle, if needed.
const fs = require("fs");
const tar = require("tar");
const {TOR_DIR} = require("../config");

let links = {
  win32: "https://archive.torproject.org/tor-package-archive/torbrowser/13.0.8/tor-expert-bundle-windows-i686-13.0.8.tar.gz",
  linux: "https://archive.torproject.org/tor-package-archive/torbrowser/13.0.8/tor-expert-bundle-linux-i686-13.0.8.tar.gz",
  darwin: "https://archive.torproject.org/tor-package-archive/torbrowser/13.0.8/tor-expert-bundle-macos-aarch64-13.0.8.tar.gz" /* this wont work probably, too bad. */
};




async function downloadTar(){
  const res = await fetch( links[process.platform] );
  const stream = fs.createWriteStream("bundle.tar.gz", {flags: "wx"});

  await require("stream/promises").finished(
    require("stream").Readable.fromWeb(res.body).pipe(stream)
  );


  // extract & remove
  fs.mkdir(TOR_DIR, console.error);
  fs.writeFileSync(`${TOR_DIR}/torrc`, "# https://github.com/radii/tor/blob/master/src/config/torrc.sample.in\n");

  tar.x({
    file: "bundle.tar.gz",
    cwd: TOR_DIR,
    sync: true
  });
  fs.unlink("bundle.tar.gz", console.error);
}


module.exports = async(ipc)=>{
  if (!fs.existsSync(TOR_DIR)) {
    ipc.sender.send("status", "Downloading tor bundle...");
    await downloadTar();
  }

  ipc.sender.send("status", "Ready");
}