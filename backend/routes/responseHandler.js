const createError = require('http-errors');

function sendHttpErrorResponse(error, res) {
  const errorResponse = {
    code: error.status || 500,
    message: error.message
  };
  res.status(errorResponse.code);
  res.json(errorResponse);
}

class ResponseHandler {
  // eslint-disable-next-line no-unused-vars
  static handleErrorsAndRespond(error, req, res, next) {
    let httpError;
    if (createError.isHttpError(error)) {
      httpError = error;
    } else {
      // eslint-disable-next-line no-console
      console.error(error);
      httpError = new createError.InternalServerError();
    }
    sendHttpErrorResponse(httpError, res);
  }

  static sendMethodNotAllowed(req, res) {
    sendHttpErrorResponse(
      new createError.MethodNotAllowed(),
      res,
    );
  }

  static sendNotFound(req, res) {
    sendHttpErrorResponse(
      new createError.NotFound(),
      res,
    );
  }

  static successfullyRespondWithData(req, res) {
    res.status(200);
    res.json(res.locals?.data || {});
  }
}

module.exports = ResponseHandler;
