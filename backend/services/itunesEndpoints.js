class ItunesEndpoints {
  static itunesHost() {
    return 'https://itunes.apple.com/';
  }

  static artistSearchUrl(encodedSearchText) {
    return `${this.itunesHost()}search?term=${encodedSearchText}&entity=allArtist`;
  }

  static albumsByArtistIdUrl(artistId) {
    return `${this.itunesHost()}lookup?id=${artistId}&entity=album&limit=200`;
  }
}

module.exports = ItunesEndpoints;
