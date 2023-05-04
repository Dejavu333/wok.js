#!/usr/bin/env node

/* wrapper script that calls the script that calls the npm run fry command, thus the script becomes available globally on the os */
const { exec } = require('child_process');
let callerPath = process.cwd();
let calleePath = __dirname;
  console.log("caller:"+callerPath);
  console.log("callee:"+calleePath);

//todo should handle the case where the user is in the _src directory or the _build directory or the deeper

const nodemonCommand = `npx nodemon --watch "${callerPath}/_src" --ext html,js,css --ignore node_modules fry.js "${callerPath}"`;
const liveServerCommand = `npx live-server "${callerPath}/_build/index.html" --watch="${callerPath}/_build/index.html" --port=8080 --open="${callerPath}/_build/index.html"`;


// Execute the commands sequentially
const observer = exec(nodemonCommand, { cwd: calleePath, shell: true });
console.log(nodemonCommand);
observer.stdout.on('data', (data) => {
  console.log(`observer output: ${data}`);
});
observer.stderr.on('data', (data) => {
  console.error(`observer error: ${data}`);
});
observer.on('close', (code) => {
  console.log(`observer exited with code ${code}`);
});


const liveServer = exec(liveServerCommand, { cwd: calleePath, shell: true });
console.log(liveServerCommand);
liveServer.stdout.on('data', (data) => {
  console.log(`live-server output: ${data}`);
});
liveServer.stderr.on('data', (data) => {
  console.error(`live-server error: ${data}`);
});
liveServer.on('close', (code) => {
  console.log(`live-server exited with code ${code}`);
});