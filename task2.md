# Task 2

## Step 1

There are several problems in the code, the main ones related to execution paths not being checked. We can see this very clearly 
in the callback functions from superagent.send and findOneAndUpdate among others, when the err values are not being checked.
Another example is the save method from mongoose models, it never checks the outcome of it. Besides that, only response statuses 200 and 201 are considered 
when performing a get with superagent, so it could perfectly return an error status and the api will send a default status response without managing it.

Moreover, the request body and parameters are not being validated, so it could directly pass any kind of information that could cause security issue or cause
unnecessary requests to the auth system. Since, as commented, it is just checking 200 and 201 responses, this will cause another problem too.

On the other hand, there are several parts that could be definitely improved. For instance, the error messages are poorly managed in the following code:
    if (err || !shop) {
        return res.status(500).send(err || { message: 'No shop found' });
    }

It is sending a 500 error if the shop does not exist or there is an error. Probably, we would like to return a 400 Bad request error if the shop does not exist.

It could also make use of the Javascript ES6 features. It should use let and cost instead of var, to make sure the variables have the proper scope. Additionally, it could also use arrow functions, destructuring or spread when manipulating objects and promises, which makes it more easy to read.

To conclude, the code is not reusable at all, it is not easy to read, and it hides a lot of execution paths that are not properly managed. In the following section I
will propose a better approach to fix all those issues.

## Step 2


    const createHttpError = require("http-errors");

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