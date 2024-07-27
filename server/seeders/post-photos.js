/* 
 Export links to photos for posts for demo purposes. These will eventually reside in the Photos table
 of the DB and be integrated with calls to the Flickr API.

 Photos below are all "medium-500" sizes on Flickr.
 */

function shuffle(array) {
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

const image1 = "https://live.staticflickr.com/65535/49640252638_051a4c4951.jpg";
const image2 = "https://live.staticflickr.com/65535/49006190053_4fbb4b8362_z.jpg";
const image3 = "https://live.staticflickr.com/6123/6018848148_85f8e94d12.jpg";
const image4 = "https://live.staticflickr.com/448/19455280650_42eefdbd80.jpg";
const image5 = "https://live.staticflickr.com/2860/9120490998_e453ed60f0.jpg";
const image6 = "https://live.staticflickr.com/7221/7184585424_7136087746.jpg";
const image7 = "https://live.staticflickr.com/7221/7184590172_280b8c74cd.jpg";
const image8 = "https://live.staticflickr.com/2831/9485788325_15bab9357a.jpg";
const image9 = "https://live.staticflickr.com/3860/15041156835_b163a9a4fc.jpg";
const image10 = "https://live.staticflickr.com/5624/22774960680_4809b5c481.jpg";
const image11 = "https://live.staticflickr.com/5613/15568212790_bf07898e57.jpg";
const image12 = "https://live.staticflickr.com/7622/26778543566_2ed4db6619.jpg";
const image13 = "https://live.staticflickr.com/8885/28791401451_27f8f86100.jpg";
const image14 = "https://live.staticflickr.com/7300/9210986658_712dcf10ab.jpg";
const image15 = "https://live.staticflickr.com/7302/9438476577_b69d020a24.jpg";

const alt1 = "Record-setting relay";
const alt2 = "The legendary Betsy D";
const alt3 = "Kate clowning around before racing";
const alt4 = "Celebrating after finishing the Chris Greene cable swim";
const alt5 = "Putting on their race faces before a relay";
const alt6 = "Marie is a rock star";
const alt7 = "Young ladies showing off their hardware";
const alt8 = "Jocelyn exulting after the cable swim";
const alt9 = "Enjoying a team dinner";
const alt10 = "Blast from the past: VMST at Nationals, Ft Lauderdale, 1995";
const alt11 = "Charles turning in the 100 breast";
const alt12 = "Kirk happy after a PB in the 100 back";
const alt13 = "Jumping for joy at Lake Moomaw";
const alt14 = "Mass start of the Jack King Ocean swim";
const alt15 = "After the race at Lake Moomaw";

const postPhotos = shuffle([
  { url: image1, alt: alt1 },
  { url: image2, alt: alt2 },
  { url: image3, alt: alt3 },
  { url: image4, alt: alt4 },
  { url: image5, alt: alt5 },
  { url: image6, alt: alt6 },
  { url: image7, alt: alt7 },
  { url: image8, alt: alt8 },
  { url: image9, alt: alt9 },
  { url: image10, alt: alt10 },
  { url: image11, alt: alt11 },
  { url: image12, alt: alt12 },
  { url: image13, alt: alt13 },
  { url: image14, alt: alt14 },
  { url: image15, alt: alt15 },
]);

module.exports = postPhotos;
