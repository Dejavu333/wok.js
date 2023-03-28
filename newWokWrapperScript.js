#!/usr/bin/env node

/* wrapper script that calls the script that calls newWok.js, thus the script becomes available globally on the os */
const fs = require('fs');
const { exec } = require('child_process');
const callerPath = process.cwd();
const calleePath = __dirname;

let targetDirectory = "";

if (callerPath.includes("/_src/_woks")) {
  targetDirectory = callerPath;
}
else if (callerPath.includes("\\_src\\_woks")) {
  targetDirectory = callerPath;
}

if (callerPath.includes("/_src")) {
  targetDirectory = callerPath.slice(0, callerPath.indexOf("/_src"));
  targetDirectory = `${targetDirectory}/_src/_woks`;
}
else if (callerPath.includes("\\_src")) {
  targetDirectory = callerPath.slice(0, callerPath.indexOf("\\_src"));
  targetDirectory = `${targetDirectory}\\_src\\_woks`;
}

else if (callerPath.includes("/_build")) {
  targetDirectory = callerPath.slice(0, callerPath.indexOf("/_build"));
  targetDirectory = `${targetDirectory}/_src/_woks`;
}
else if (callerPath.includes("\\_build")) {
  targetDirectory = callerPath.slice(0, callerPath.indexOf("\\_build"));
  targetDirectory = `${targetDirectory}\\_src\\_woks`;
}

else {
  targetDirectory = `${callerPath}/_src/_woks`;
}


if (!fs.existsSync(targetDirectory)) {
  console.log('\x1b[31m','Error:','\x1b[37m','No _woks directory found at projectroot/_src/_woks');
  process.exit(1);
}

const args = process.argv.slice(2);
const filename = args[0];

exec(`node newWok.js "${targetDirectory}" "${filename}"`, { cwd: calleePath }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return
  }
  console.log(stdout);
  console.error(stderr);
});