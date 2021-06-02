# Task 2

## Step 1

There are several problems in the code, the main ones related to execution paths not being checked. We can see this very clearly in the callback functions from superagent.send and findOneAndUpdate among others, when the err values are not being checked. Another example is the save method from mongoose models, it never checks the outcome of it. Besides that, only response statuses 200 and 201 are considered when performing a get with superagent, so it could perfectly return an error status and the api will send a default status response without managing it.

Moreover, the request body and parameters are not being validated, so it could directly pass any kind of information that could cause security issue or cause unnecessary requests to the auth system. Since, as commented, it is just checking 200 and 201 responses, this will cause another problem too.

On the other hand, there are several parts that could be definitely improved. For instance, the error messages are poorly managed in the following code:
    
    if (err || !shop) {
        return res.status(500).send(err || { message: 'No shop found' });
    }

It is sending a 500 error if the shop does not exist or there is an error. Probably, we would like to return a 400 Bad request error if the shop does not exist.

It could also make use of the Javascript ES6 features. It should use let and cost instead of var, to make sure the variables have the proper scope. Additionally, it could also use arrow functions, destructuring or spread when manipulating objects and promises, which makes it more easy to read.

To conclude, the code is not reusable at all, it is not easy to read, and it hides a lot of execution paths that are not properly managed. In the following section I will propose a better approach to fix all those issues.

## Step 2

A possible solution could take advantage of the express middlewares when managing routes. That is, it will split the code into smaller functions that will be executed one after the other, processing smaller pieces of information and passing the data to the next middleware or failing. This will greatly contribute to the readability and understandability of the code, but it will also make it more reusable (middleware functions could be used in other methods and routes of the api).

In this example, I will also use http-errors to easily manage the http exceptions the api might generate.

    const createHttpError = require("http-errors");

### 1) Validate request content and parameters
This first middleware will check the body and input parameters of the request. The isValidShopId and isValidInvitation are functions are not included for simplicity since they will not add much value to the exercice and the example does not specify the exact fields and correct formats that we could expect.

At least, isValidShopId should check the param is present and the value is acceptable (for instance, it could expect an Integer).
Similarly, isValidInvitation should process the invitation to check all required fields are present and, for instance, it could check the
format of the email is correct.

If shopId and invitation body are accepted, then it assigns the processed invitation to the req locals, so the next middlewares will be able to use it.
If the validations fail, then it fails with a BadRequest containing the specific error.

    function validateUserInvitation(req, res, next) {
        const invitation = req.body;
        // validates shopId param exists and its format is correct
        if (!isValidShopId(req.params?.shopId)) { 
            next(new createHttpError.BadRequest('Shop id not set or not valid'));
        }
        // validates if format of the invitation is correct and the required params
        // are present and have valid values.
        if (isValidInvitation(invitation)) { 
            req.locals = { invitation };
            next();
        } else return next(new createHttpError.BadRequest('The invitation provided is not valid'));
    }

### 2) Find shop by id

This is a major change from the original code. The original one requests the auth system first to auth the invitation and then, if the shop does not exist, it returns a 500 response. Since a successful response must update a shop with a user, the new code will try to find that shop before the user is created. Otherwise, it could produce an inconclusive state (user invitation saved, but not found in any shop). Furthermore, invite api might not have any shop logic, so it will confirm invitation without knowing if the shop exists.

from the exceptions perspective, the code has also been improved so it will send a 400 Bad request if the shop does not exist or a 500 Internal Server Error if an error occurred while finding the shop.

Finally, if the shop exists, it will be saved to a shop local object from req, so it can be reused and available to any other middleware that processes shops.

    function findShopById(req, res, next) {
        Shop.findById(req.params.shopId)
            .exec()
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

### 3) Auth user invitaton

In this step it will send the request to auth the user invitation and will save the invitation response to res locals.

To perform the request, I have also added an AuthSystemEndpoints with static methods that manages in one place the endpoints from the authSystem.

Note: It was not clear from the original code whether a user can be invited to more than one shop or not.
If so (as suggested in the new code), it will successfully continue through the middlewares even if the API responses 200. Otherwise,
the code should be uncommented in order to fail (as it actually happened in the original code, but it could be a dev bug).

    function authUserInvitation(req, res, next) {
        superagent
            .post(AuthSystemEndpoints.getAuthInvitationUrl()) // returns "https://url.to.auth.system.com/invitation"
            .send(req.locals.invitation)
            .then((invitationResponse) => {
                if (!invitationResponse) {
                    next(new createHttpError.InternalServerError());
                }
                switch(invitationResponse.status) {
                    case 200:
                       // Business logic: I will suposo a user can be invited to more than one shop.
                       // next(new createHttpError.BadRequest('User already invited to this shop'));
                       // break;
                    case 201:
                        res.locals.invitation = invitationResponse.body;
                        next();
                        break;
                    default:
                        next(new createHttpError.InternalServerError())
                        break;
                }
            })
            .catch((error) => {
                next(new createHttpError.InternalServerError());
            });
    }

### 4) Create or update user from invitation
If the user could be invited, then the following middleware function will update the users data to register a new user or update the existing one with a new auth id. If the query fails for some reason, it will pass an Internal Server Error.

    function upsertUserFromInvitation(req, res, next)  {
        User.findOneAndUpdate(
            ...getFindUserAndUpdateParameters(res.locals.invitation.authId,
                                              req.locals.invitation.email))
            .exec()                                
            .then((upsertUser) => {
                res.locals.user = createdUser;
                next();
            })
            .catch((error) => {
                next(new createHttpError.InternalServerError());
            });
    }

To simplify the code, I also added the following function to build and return the needed arguments according to authId and email. Then, those arguments are passed to the function using spread.

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


### 5) Update shop users
Finally, as a last update, it updates the shop adding the new invitation and user to its invitations and users collection.
As an improvement, apart from managing the exceptions, it will only update the users if the invitation is new
(the user was not added to the shop). Additionally, the shop will only be saved if a user or invitation was added.


    function updateShopUsers(req, res, next) {
        const shop = req.locals.shop;

        if (shop.invitations.indexOf(res.locals.invitation.invitationId) === -1) {
            shop.invitations.push(res.locals.invitation.invitationId);
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
        next(new createHttpError.BadRequest('User already invited to this shop.));    
    }


### 6) Send response to the client
If this middleware gets reached, then the whole execution succeeded. In that case, it will return a 200 OK status and the
invitation content as a json.

    function sendInvitationResponse(req, res) {
        reset.status(200);
        res.json(res.locals.invitation);
    }

### 7) Handle errors
If an error was passed as a next argument in any of the previous middlewares, this function will be immediately executed as a next middleware.
If the error is a known http error, it will send the json response with the status code and message received.
Otherwise, it will mean the exception was not controlled. If that is the case, the error should be logged and just
send a 500 error response (for simplicity, it will just log the error in the console, but it could use any other logging system).

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

To configure the middleware flow, the following route schema could be used.

    invitationsRouter.route('api/path/inviteUser')
        .get(validateUserInvitation,
            findShopById,
            authUserInvitation,
            upsertUserWithInvitation,
            updateShopUsers,
            handleErrors,
            sendInvitationResponse
        )
        .all(ResponseHandler.sendMethodNotAllowed);
