const { json } = require("body-parser");
const createHttpError = require("http-errors");
const { reset } = require("sinon");

function validateUserInvitation(req, res, next) {
    const invitation = req.body;
    if (!validShopId(req.params?.shopId)) { // validates shopId param has a correct value
        next(new createHttpError.BadRequest('Shop id not set or not valid'));
    }
    if (validInvitation(invitation)) {  // validates format of the invitation is correct and the required params are present and have valid values.
        req.locals = { invitation };
        next();
    } else return next(new createHttpError.BadRequest('The invitation provided is not valid'));
}

// if the shop does not exist, we are returning a 500 response.
// since a successful response must update a shop with a user, it should try to find 
// the shop before a user is created, otherwise there could be an incolusive state
// (user invitation saved, but not found in any shop).
// furthermore, invite api might not have any shop logic, so it could send invitation
// without knowing if the shop exists
function findShopById(req, res, next) {
    Shop.findById(req.params.shopId)
        .then((value) => {
            if (!value) next(new createHttpError.BadRequest('No shop found with the id specified'))
            req.locals.shop = value;
            next();
        })
        .catch((error) => {
            console.log(error);
            next(new createHttpError.InternalServerError('Shop could not be retrieved'));
        });
}

function updateShopUsers(userCreated, shop, invitationId) {
    const shop = req.locals.shop;

    if (shop.invitations.indexOf(res.locals.invitation.invitationId) === -1) {
        shop.invitations.push(res.locals.invitation.invitationId);
    }
    if (shop.users.indexOf(res.locals.user._id) === -1) {
        shop.users.push(res.locals.user);
    }
    shop.save()
        .then((shop) => { next(); })
        .catch((error) => {
            console.log(error);
            next(new createHttpError.InternalServerError());
        });
}

function sendInvitationResponse(req, res) {
    reset.status(200);
    res.json(res.locals.invitation);
}

function handleErrors(error, req, res, next) {
    let httpError;
    if (createError.isHttpError(error)) {
      httpError = error;
    } else {
      console.error(error);
      httpError = new createError.InternalServerError();
    }
    res.status(httpError.status);
    res.json({
        status: httpError.status,
        message: httpError.message,
    });
}

function upsertUserWithInvitation(req, res, next)  {
    User.findOneAndUpdate(
        ...getFindUserAndUpdateParameters(
            res.locals.invitation.authId,
            req.locals.invitation.email),
        function (err, createdUser) {
            if (err || !createdUser) next(new createHttpError.InternalServerError());
            else {
                res.locals.user = createdUser;
                next();
            }
        }
    );
}

function requestUserInvitation(req, res, next) {
    superagent
        .post(AuthSystemEndpoints.getInvitationUrl()) // returns "https://url.to.auth.system.com/invitation"
        .send(req.locals.invitation)
        .end(function (err, invitationResponse) {
            if (err || !invitationResponse) {
                next(new createHttpError.InternalServerError());
            }
            switch(invitationResponse.status) {
                case 201:
                    res.locals.invitation = invitationResponse.body;
                    next();
                    break;
                case 200:
                    next(new createHttpError.BadRequest('User already invited to this shop'));
                default:
                    next(new createHttpError.InternalServerError())
                    break;
            }
        });
}

function getFindUserAndUpdateParameters(authId, email) {
    return [{
        authId
    }, {
        authId,
        email
    }, {
        upsert: true,
        new: true
    }]
}

invitationsRouter.route('api/path/inviteUser')
    .get(validateUserInvitation,
        findShopById,
        requestUserInvitation,
        upsertUserWithInvitation,
        updateShopUsers,
        handleErrors,
        sendInvitationResponse
    )
    .all(ResponseHandler.sendMethodNotAllowed);