// Helper function to import a CSV file.
// Taken from "Data Wrangling with JavaScript" by Ashley Davis

const papa = require('papaparse');
const file = require('./file')

// input is the path to the file on the local system, will need to be replaced with
// the object obtained from the client side?
function importCsvFile(filePath) {
  return file.read(filePath)
    .then(textFileData => {
      const result = papa.parse(textFileData, {
        header: true,
        dynamicTyping: true,
      });
      return result.data;
    });
};

module.exports = importCsvFile;
