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

// reflects featured photos on 08/01/24
const featuredPhotos = [
  {
    id: '49640252638',
    secret: '051a4c4951',
    server: '65535',
    caption: 'Record-setting relay!',
    url: 'https://live.staticflickr.com/65535/49640252638_051a4c4951.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/49640252638'
  },
  {
    id: '49006190053',
    secret: '4fbb4b8362',
    server: '65535',
    caption: 'The legendary Betsy D',
    url: 'https://live.staticflickr.com/65535/49006190053_4fbb4b8362.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/49006190053'
  },
  {
    id: '36576299225',
    secret: 'fa4f94838f',
    server: '4400',
    caption: 'VMST at summer nationals',
    url: 'https://live.staticflickr.com/4400/36576299225_fa4f94838f.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/36576299225'
  },
  {
    id: '33151523153',
    secret: '72e004de3a',
    server: '2910',
    caption: 'Greg doing breaststroke leg of the relay',
    url: 'https://live.staticflickr.com/2910/33151523153_72e004de3a.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/33151523153'
  },
  {
    id: '28791401451',
    secret: '27f8f86100',
    server: '8885',
    caption: 'Lake Moomaw makes us jump for joy',
    url: 'https://live.staticflickr.com/8885/28791401451_27f8f86100.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/28791401451'
  },
  {
    id: '26778543566',
    secret: '2ed4db6619',
    server: '7622',
    caption: 'Kirk celebrating his 100 Back',
    url: 'https://live.staticflickr.com/7622/26778543566_2ed4db6619.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/26778543566'
  },
  {
    id: '26736014941',
    secret: 'e8f85b9438',
    server: '7370',
    caption: 'Mariah swims the 50 Fly',
    url: 'https://live.staticflickr.com/7370/26736014941_e8f85b9438.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/26736014941'
  },
  {
    id: '26358926625',
    secret: 'd70d53356f',
    server: '1469',
    caption: "Ed's happy face",
    url: 'https://live.staticflickr.com/1469/26358926625_d70d53356f.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/26358926625'
  },
  {
    id: '23674384461',
    secret: '8d6bef8b6b',
    server: '715',
    caption: 'Jay Peluso, emcee extraordinaire',
    url: 'https://live.staticflickr.com/715/23674384461_8d6bef8b6b.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/23674384461'
  },
  {
    id: '22966265665',
    secret: '7ea13a7fa9',
    server: '643',
    caption: 'Ready to swim',
    url: 'https://live.staticflickr.com/643/22966265665_7ea13a7fa9.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/22966265665'
  },
  {
    id: '22949852132',
    secret: '8caa6e81cd',
    server: '653',
    caption: 'Five buddies in Virginia Beach',
    url: 'https://live.staticflickr.com/653/22949852132_8caa6e81cd.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/22949852132'
  },
  {
    id: '22775243290',
    secret: '7b3135eabd',
    server: '5649',
    caption: 'Another day, another relay record falls',
    url: 'https://live.staticflickr.com/5649/22775243290_7b3135eabd.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/22775243290'
  },
  {
    id: '22774960680',
    secret: '4809b5c481',
    server: '5624',
    caption: 'Blast from the past! 1995 nationals at Ft Lauderdale',
    url: 'https://live.staticflickr.com/5624/22774960680_4809b5c481.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/22774960680'
  },
  {
    id: '19617092296',
    secret: '20eee9321c',
    server: '537',
    caption: 'Dave has it under control',
    url: 'https://live.staticflickr.com/537/19617092296_20eee9321c.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/19617092296'
  },
  {
    id: '19636231002',
    secret: '8c2c1297c0',
    server: '3775',
    caption: 'Pre-race instructions from Jim',
    url: 'https://live.staticflickr.com/3775/19636231002_8c2c1297c0.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/19636231002'
  },
  {
    id: '19455280650',
    secret: '42eefdbd80',
    server: '448',
    caption: 'Celebrating after finishing the Chris Greene cable swim',
    url: 'https://live.staticflickr.com/448/19455280650_42eefdbd80.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/19455280650'
  },
  {
    id: '19007919433',
    secret: '1aeca63a62',
    server: '351',
    caption: 'Team Shrum well represented at the cable swim',
    url: 'https://live.staticflickr.com/351/19007919433_1aeca63a62.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/19007919433'
  },
  {
    id: '19602688596',
    secret: '47dc5952e2',
    server: '267',
    caption: 'A quiet moment before the cable swim',
    url: 'https://live.staticflickr.com/267/19602688596_47dc5952e2.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/19602688596'
  },
  {
    id: '16069523105',
    secret: '3d93db4d17',
    server: '7499',
    caption: 'Shirley, Denise, and Greg with some hardware',
    url: 'https://live.staticflickr.com/7499/16069523105_3d93db4d17.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/16069523105'
  },
  {
    id: '15568212790',
    secret: 'bf07898e57',
    server: '5613',
    caption: 'Charles with a fast turn in the 100 Breast',
    url: 'https://live.staticflickr.com/5613/15568212790_bf07898e57.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/15568212790'
  },
  {
    id: '15041156835',
    secret: 'b163a9a4fc',
    server: '3860',
    caption: 'VMST team dinner at nationals',
    url: 'https://live.staticflickr.com/3860/15041156835_b163a9a4fc.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/15041156835'
  },
  {
    id: '14791558107',
    secret: '6289c9d3bd',
    server: '5557',
    caption: 'Patty and Kitten mugging for the camera',
    url: 'https://live.staticflickr.com/5557/14791558107_6289c9d3bd.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/14791558107'
  },
  {
    id: '14963860045',
    secret: 'bdf090766a',
    server: '5562',
    caption: 'Tess brings home the gold!',
    url: 'https://live.staticflickr.com/5562/14963860045_bdf090766a.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/14963860045'
  },
  {
    id: '9485788325',
    secret: '15bab9357a',
    server: '2831',
    caption: 'Jocelyn exulting after her cable swim',
    url: 'https://live.staticflickr.com/2831/9485788325_15bab9357a.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/9485788325'
  },
  {
    id: '9438476577',
    secret: 'b69d020a24',
    server: '7302',
    caption: 'After the race at Lake Moomaw',
    url: 'https://live.staticflickr.com/7302/9438476577_b69d020a24.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/9438476577'
  },
  {
    id: '9120490998',
    secret: 'e453ed60f0',
    server: '2860',
    caption: 'Put on your race faces, ladies',
    url: 'https://live.staticflickr.com/2860/9120490998_e453ed60f0.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/9120490998'
  },
  {
    id: '9210986658',
    secret: '712dcf10ab',
    server: '7300',
    caption: 'Mass start at Jack King ocean swim',
    url: 'https://live.staticflickr.com/7300/9210986658_712dcf10ab.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/9210986658'
  },
  {
    id: '7184585424',
    secret: '7136087746',
    server: '7221',
    caption: 'Marie is a rock star!',
    url: 'https://live.staticflickr.com/7221/7184585424_7136087746.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/7184585424'
  },
  {
    id: '7184590172',
    secret: '280b8c74cd',
    server: '7221',
    caption: 'Young ladies showing off their hardware',
    url: 'https://live.staticflickr.com/7221/7184590172_280b8c74cd.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/7184590172'
  },
  {
    id: '6018848148',
    secret: '85f8e94d12',
    server: '6123',
    caption: 'Kate clowning around',
    url: 'https://live.staticflickr.com/6123/6018848148_85f8e94d12.jpg',
    flickrURL: 'https://www.flickr.com/photos/50570696@N06/6018848148'
  }
];

// shuffle and truncate (for 15 posts)
const postPhotos = shuffle(featuredPhotos).slice(0, 15);

module.exports = postPhotos;
