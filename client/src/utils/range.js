/* 
 Adapted from JWC, https://www.joshwcomeau.com/snippets/javascript/range/
 Outputs a range of numbers from inputs "start" to "end", inclusive of both

 range(5) will output [1, 2, 3, 4, 5], an array of length 5
 */

const range = (start, end, step = 1) => {
  let output = [];
  if (typeof end === "undefined") {
    // user only input one number
    end = start;
    start = 1;
  }
  for (let i = start; i <= end; i += step) {
    output.push(i);
  }
  return output;
};

export default range;
