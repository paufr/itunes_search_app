const ItunesEndpoints = require('./itunesEndpoints');
const Artist = require('./models/artist');
const Album = require('./models/album');

// parses the album list according to the album model,
// filtering repeated results based on album name
// it also return the artist of the albums
function parseResultsToAlbumListByArtist(responseData) {
  if (!responseData.results) throw new Error('Results not recognized');
  let artist = {};
  const albums = [];
  if (responseData.results.length > 0) {
    const idSet = new Set();
    responseData.results.forEach((item) => {
      if (item.collectionType === 'Album' && !idSet.has(item.collectionName)) {
        albums.push(
          new Album(item.collectionName, item.collectionId,
            item.artistName, item.artistId,
            item.artworkUrl100, item.primaryGenreName,
            item.country, item.releaseDate),
        );
        idSet.add(item.collectionName);
      } else if (item.wrapperType === 'artist') {
        artist = new Artist(item.artistName, item.artistId, item.primaryGenreName);
      }
    });
  }
  return { artist, albums };
}

function parseResultsToArtistsList(responseData) {
  if (!responseData.results) {
    throw new Error('Results not recognized');
  }
  const artists = [];
  responseData.results.forEach((artistItem) => {
    if (!artistItem.artistId || !artistItem.artistName) {
      throw new Error('Response data not recognized');
    }
    artists.push(
      new Artist(artistItem.artistName, artistItem.artistId, artistItem.primaryGenreName),
    );
  });
  return artists;
}

class ItunesService {
  constructor(requester) {
    this.requester = requester;
  }

  async getAlbumsFromArtist(artistId) {
    const response = await this.requester
      .getJsonAsync(ItunesEndpoints.albumsByArtistIdUrl(artistId));
    if (response.error) {
      throw response.error;
    }
    return parseResultsToAlbumListByArtist(response.data);
  }

  async getArtistsFromSearchText(searchText) {
    const response = await this.requester
      .getJsonAsync(ItunesEndpoints.artistSearchUrl(searchText));
    if (response.error) {
      throw response.error;
    }
    return parseResultsToArtistsList(response.data);
  }
}

module.exports = ItunesService;
