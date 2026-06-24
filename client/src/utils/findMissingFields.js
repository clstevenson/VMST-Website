// Generic across any array of flat objects: returns, for each field in
// requiredFields that's falsy on at least one row, the list of row indices
// where it's missing -- {field: [rowIndex, ...]}. Used to catch a CSV
// missing a required column on the client, before ever building GraphQL
// variables, instead of reaching the server and coming back as a raw
// graphql-js variable-coercion error.

const findMissingFields = (rows, requiredFields) => {
  const rowsByField = {};
  rows.forEach((row, index) => {
    requiredFields.forEach((field) => {
      if (!row[field]) {
        (rowsByField[field] ??= []).push(index);
      }
    });
  });
  return rowsByField;
};

export default findMissingFields;
