/*
 * A collection of three utility functions to return information
 * from the LMSC Flickr account: www.flickr.com/photos/va_swims/
 *
 * getFeaturedPhotos() returns info about the photos in the
 * "VMST Featured Photos" photoset ("album")
 *
 * getAlbumPhotos({album-id}) does the same, but for any photoset.
 * (In fact, getFeaturedPhotos calls this function)
 *
 * getAlbums() returns info about the photosets, with links
 * to the "featured photo" of that album and the album itself
 *
 * getPhotos() returns info about photos in the photostream,
 * optionally filtered by a search term
 *
 * getPhotoSizes({photo-id}) returns all available sizes (with links)
 * for a given photo.
 *
 * Many functions accept parameters relating to pagination;
 * 'perPage' defaults to 15 items, 'page' defaults to page 1.
 * The returned object contains information on total number of items and pages
 *
 * The getPhotos() function also accepts a search term as the 3rd param
 */

// URL format: https://live.staticflickr.com/{server-id}/{id}_{secret}.jpg
// go to https://www.flickr.com/services/api/misc.urls.html for more details

const { createFlickr } = require("flickr-sdk");
require('dotenv').config();

// account info
const flickrAPI = process.env.FLICKR_APIKEY;
const userId = '50570696@N06';
// "VMST featured" photoset
const featuredPhotoset = '72177720319183779';

const { flickr } = createFlickr(flickrAPI);

// gets a list of photosets; excludes the "featured photos" photoset,
// since that photoset can be displayed separately
const getAlbums = async (perPage = 15, page = 1) => {
  const response = await flickr("flickr.photosets.getList", {
    api_key: flickrAPI,
    user_id: userId,
    per_page: perPage,
    page: page,
  });

  if (response.stat !== 'ok') {
    throw new Error('Something went wrong retrieving the data from Flickr');
  }

  // array of album/photoset characteristics
  const album = response.photosets.photoset
    .map(
      ({ id, primary, secret, server, title: { _content: caption } }) => {
        return {
          id, primary, secret, server, caption,
          coverURL: `https://live.staticflickr.com/${server}/${primary}_${secret}.jpg`,
          albumURL: `https://www.flickr.com/photos/${userId}/albums/${id}`,
        }
      })
    // don't want to include featured set
    .filter(({ id }) => id !== featuredPhotoset);

  // need total number of albums for pagination
  let { total, pages } = response.photosets;
  // subtract one for featured set, which isn't included
  total--;

  const albumsURL = `https://www.flickr.com/photos/${userId}/albums/`;

  return { total, pages, albumsURL, album }
}

// retrieve information about photos in a specific photoset/album
// one argument is required: the album ID, as a string
const getAlbumPhotos = async (albumId, perPage = 15, page = 1) => {
  const response = await flickr("flickr.photosets.getPhotos", {
    api_key: flickrAPI,
    photoset_id: albumId,
    per_page: perPage,
    page: page,
  });

  if (response.stat !== 'ok') {
    throw new Error('Something went wrong retrieving the data from Flickr');
  }

  const photo = response.photoset.photo.map(
    ({ id, secret, server, title: caption }) => {
      return {
        id, secret, server, caption,
        url: `https://live.staticflickr.com/${server}/${id}_${secret}.jpg`,
      };
    });

  // need more info for pagination and display
  const { title, total, pages } = response.photoset;
  const albumURL = `https://www.flickr.com/photos/${userId}/albums/${albumId}`;

  return { title, total, pages, albumURL, photo };
}

// retrieves photos that are in the album that is designated to
// holds photos specifically chosen for the website (eg for posts)
const getFeaturedPhotos = async (perPage = 15, page = 1) => {
  return getAlbumPhotos(featuredPhotoset, perPage, page);
}

// get a list of all photos in descending order of recency
// accepts third argument as a free text search of title, description, or tags
const getPhotos = async (perPage = 15, page = 1, searchTerm = '') => {
  const response = await flickr("flickr.photos.search", {
    api_key: flickrAPI,
    user_id: userId,
    text: searchTerm,
    per_page: perPage,
    page: page,
  });

  if (response.stat !== 'ok') {
    throw new Error('Something went wrong retrieving the data from Flickr');
  }

  const photo = response.photos.photo.map(
    ({ id, secret, server, title: caption }) => {
      return {
        id, secret, server, caption,
        url: `https://live.staticflickr.com/${server}/${id}_${secret}.jpg`,
        flickrURL: `https://live.staticflickr.com/${server}/${id}`,
      }
    });

  const { pages, total } = response.photos;
  const photosURL = `https://www.flickr.com/photos/${userId}/`;

  return { pages, total, photosURL, photo }
}

// return the available sizes for a specific photo
// also returns the Flickr URL of the photo
// requires the ID of the photo as input argument, as a string
const getPhotoSizes = async (photoId) => {
  const response = await flickr("flickr.photos.getSizes", {
    api_key: flickrAPI,
    photo_id: photoId,
  });

  if (response.stat !== 'ok') {
    throw new Error('Something went wrong retrieving the data from Flickr');
  }

  const size = response.sizes.size.map(
    ({ label, width, height, source: url }) => {
      return { label, width, height, url };
    });

  const photoURL = `https://www.flickr.com/photos/${userId}/${photoId}`;

  return { photoURL, size };
}

// for testing purposes
// async function main() {
//   value = await getAlbums();
//   console.log(value);
// }

// main();

module.exports = {
  getAlbums,
  getAlbumPhotos,
  getFeaturedPhotos,
  getPhotos,
  getPhotoSizes,
};
