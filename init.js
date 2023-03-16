#!/usr/bin/env node

// Copies essential files to the current working directory from root where the package gets installed
const fs = require('fs');
const path = require('path');

const callerPath = process.cwd();
const sourcePath = path.join(__dirname);

copyFilesRecursive(sourcePath, callerPath);

function copyFilesRecursive(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }

  // Iterate through all files and subdirectories in source directory
  const files = fs.readdirSync(source);
  files.forEach(file => {
    if (file !== "init.js") {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);

      if (fs.lstatSync(sourcePath).isDirectory()) {
        // Recursively copy subdirectory
        copyFilesRecursive(sourcePath, targetPath);
      } else {
        // Copy file to target directory
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  });
}