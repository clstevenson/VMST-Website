/*
 Export links to photos meant to be used in the banner.
*/

const hero = [
  "/assets/hero1.jpg",
  "/assets/hero2.jpg",
  "/assets/hero3.jpg",
  "/assets/hero4.jpg",
  "/assets/hero5.jpg",
  "/assets/hero6.jpg",
  "/assets/hero7.jpg",
];

const alt = [
  "Mass start of ocean swim",
  "VMST swimmers group photo in front of pool",
  "Swimmers celebrating after finishing a lake swim",
  "Swimming breastroke wearing VMST cap",
  "Swimmer waving at camera",
  "Swimmers start lake race",
  "VMST swimmer diving into pool",
];

const bannerPhotos = [];

const upper = Math.min(hero.length, alt.length);

for (let i = 0; i < upper; i++) {
  bannerPhotos.push({ url: hero[i], alt: alt[i] });
}

export default bannerPhotos;
