// function to shuffle array elements
// result is a new array; the original is not shuffled
// taken from SO: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export default function shuffle(array) {
  let currentIndex = array.length;
  let randomIndex;
  const outputArray = [...array];

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [outputArray[currentIndex], outputArray[randomIndex]] = [
      outputArray[randomIndex],
      outputArray[currentIndex],
    ];
  }
  return outputArray;
}
