/* 
 Export links to photos for posts for demo purposes. These will eventually reside in the Photos table
 of the DB and be integrated with calls to the Flickr API. Max size displayed (in gallary) is 500 x 300px
 */

// these are all "medium" size photos, appropriate for the "Gallery" page
// which uses image sizes of 500 x 300.
// URL format: https://live.staticflickr.com/{server-id}/{id}_{secret}.jpg
// go to https://www.flickr.com/services/api/misc.urls.html for more details
const image1 = "https://live.staticflickr.com/65535/49640252638_051a4c4951.jpg";
const image2 = "https://live.staticflickr.com/65535/49006190053_4fbb4b8362.jpg";
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
/*
const image16 = "/assets/photos/image16.jpg";
const image17 = "/assets/photos/image17.jpg";
const image18 = "/assets/photos/image18.jpg";
const image19 = "/assets/photos/image19.jpg";
const image20 = "/assets/photos/image20.jpg";
const image21 = "/assets/photos/image21.jpg";
const image22 = "/assets/photos/image22.jpg";
const image23 = "/assets/photos/image23.jpg";
const image24 = "/assets/photos/image24.jpg";
const image25 = "/assets/photos/image25.jpg";
const image26 = "/assets/photos/image26.jpg";
const image27 = "/assets/photos/image27.jpg";
const image28 = "/assets/photos/image28.jpg";
const image29 = "/assets/photos/image29.jpg";
const image30 = "/assets/photos/image30.jpg";
const image31 = "/assets/photos/image31.jpg";
const image32 = "/assets/photos/image32.jpg";
const image33 = "/assets/photos/image33.jpg";
 */

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
/*
const alt16 = "Swimmers awaiting race instructions at Chris Greene Lake";
const alt17 = "Flawless turn";
const alt18 = "Group photo at meet";
const alt19 = "Showing off hardware at the Zone Championships";
const alt20 = "Congrats for finishing the cable swim.";
const alt21 = "Warming up at Lake Moomaw";
const alt22 = "Unconventional warmup technique";
const alt23 = "VMST breastroker";
const alt24 = "Record-breaking VMST relay";
const alt25 = "Take your marks...";
const alt26 = "Group photo of VMST swimmers at Nationals";
const alt27 = "VMST breastroker leading the way";
const alt28 = "VMST relay exchange";
const alt29 = "VMST swimmer showing flawless dive technique";
const alt30 = "VMST swimmers enjoying a laugh";
const alt31 = "The legandary Betsy D";
const alt32 = "VMST relay after another record-breaking effort";
const alt33 = "VMST swimmers mugging for the camera";
 */

const postPhotos = [
  { id: crypto.randomUUID(), url: image1, alt: alt1 },
  { id: crypto.randomUUID(), url: image2, alt: alt2 },
  { id: crypto.randomUUID(), url: image3, alt: alt3 },
  { id: crypto.randomUUID(), url: image4, alt: alt4 },
  { id: crypto.randomUUID(), url: image5, alt: alt5 },
  { id: crypto.randomUUID(), url: image6, alt: alt6 },
  { id: crypto.randomUUID(), url: image7, alt: alt7 },
  { id: crypto.randomUUID(), url: image8, alt: alt8 },
  { id: crypto.randomUUID(), url: image9, alt: alt9 },
  { id: crypto.randomUUID(), url: image10, alt: alt10 },
  { id: crypto.randomUUID(), url: image11, alt: alt11 },
  { id: crypto.randomUUID(), url: image12, alt: alt12 },
  { id: crypto.randomUUID(), url: image13, alt: alt13 },
  { id: crypto.randomUUID(), url: image14, alt: alt14 },
  { id: crypto.randomUUID(), url: image15, alt: alt15 },
  /*
  { id: crypto.randomUUID(), url: image16, alt: alt16 },
  { id: crypto.randomUUID(), url: image17, alt: alt17 },
  { id: crypto.randomUUID(), url: image18, alt: alt18 },
  { id: crypto.randomUUID(), url: image19, alt: alt19 },
  { id: crypto.randomUUID(), url: image20, alt: alt20 },
  { id: crypto.randomUUID(), url: image21, alt: alt21 },
  { id: crypto.randomUUID(), url: image22, alt: alt22 },
  { id: crypto.randomUUID(), url: image23, alt: alt23 },
  { id: crypto.randomUUID(), url: image24, alt: alt24 },
  { id: crypto.randomUUID(), url: image25, alt: alt25 },
  { id: crypto.randomUUID(), url: image26, alt: alt26 },
  { id: crypto.randomUUID(), url: image27, alt: alt27 },
  // below is a virtual copy of photo #25
  // { id: crypto.randomUUID(), url: image28, alt: alt28 },
  { id: crypto.randomUUID(), url: image29, alt: alt29 },
  { id: crypto.randomUUID(), url: image30, alt: alt30 },
  { id: crypto.randomUUID(), url: image31, alt: alt31 },
  { id: crypto.randomUUID(), url: image32, alt: alt32 },
  { id: crypto.randomUUID(), url: image33, alt: alt33 },
   */
];

export default postPhotos;
