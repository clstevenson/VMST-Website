import papa from "papaparse";

// Wraps the FileReader + papaparse config every CSV upload in this app uses
// identically (header row, dynamic typing, skip blank lines) into a single
// promise: resolves with the parsed rows, rejects with the FileReader error.
const parseCSVFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const results = papa.parse(reader.result, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
      resolve(results.data);
    };
    reader.onerror = () => reject(reader.error);
  });

export default parseCSVFile;
