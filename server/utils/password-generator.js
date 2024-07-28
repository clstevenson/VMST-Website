// Generates a cryptographically secure random password
//
// Adapted from Xyz's answer on SO:
// https://stackoverflow.com/questions/1497481/javascript-password-generator
//
// The function contenates a number of random 64-bit words (the input param)
// to give a random mixture of characters (upper and lowercase) and numbers.
// The input argument determines how many to use; I suggest at least 3.

const generatePassword = (length = 4) => {
  const array = new BigUint64Array(length);
  return globalThis.crypto.getRandomValues(array)
    .reduce((prev, curr, index) => (
      !index ? prev : prev.toString(36)
    ) + (
        index % 2 ? curr.toString(36).toUpperCase() : curr.toString(36)
      ))
    .split('')
    .sort(() => (
      128 - globalThis.crypto.getRandomValues(new Uint8Array(1))[0]
    ))
    .join('');
}

module.exports = generatePassword;
