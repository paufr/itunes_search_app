const axios = require('axios');
const createError = require('http-errors');

function parseError(error) {
  let parsedError;
  if (error.response) {
    // unsuccessful response
    parsedError = createError(
      error.response.status,
      error.response.statusText,
      { details: error.response.data }
    );
  } else {
    parsedError = new createError
      .InternalServerError();
    parsedError.details = error;
  }
  // error exception fetching data
  return parsedError;
}
class HttpRequester {
  static async getJsonAsync(url) {
    const result = {};
    await axios.get(url)
      .then((res) => { result.data = res.data; })
      .catch((error) => { result.error = parseError(error); });
    return result;
  }
}

module.exports = HttpRequester;
