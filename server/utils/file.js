// Toolkit functions for reading and writing files.
// Taken from "Data Wrangling with JavaScript" by Ashley Davis

const fs = require('fs');

// Read a text file from the file system
function read(fileName) {
  // wrap in a promise
  return new Promise((resolve, reject) => {
    // load file content into memory
    fs.readFile(fileName, "utf8", (err, textFileData) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(textFileData);
    }
    );
  });
};

// Write a text file to the file system (not sure I'll need this other than for troubleshooting)
function write(fileName, textFileData) {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, textFileData, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    }
    );
  });
};

module.exports = { read, write };
