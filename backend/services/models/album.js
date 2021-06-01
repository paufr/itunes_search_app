class Album {
  constructor(collectionName, collectionId, artistName,
    artistId, thumbnail, genre, country, releaseDate) {
    this.collectionId = collectionId;
    this.collectionName = collectionName;
    this.artistName = artistName;
    this.artistId = artistId;
    this.genre = genre;
    this.country = country;
    this.thumbnail = thumbnail;
    this.releaseDate = releaseDate;
  }
}

module.exports = Album;
