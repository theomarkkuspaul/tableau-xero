var OAuth = require("oauth");

const Q = require('q');
const dynasty = require('dynasty')({
  access_token: process.env.AWS_ACCESS_KEY_ID,
  secret_key: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-2'
});

var REQUEST_URL = 'https://api.xero.com/oauth/RequestToken';
var ACCESS_URL = 'https://api.xero.com/oauth/AccessToken';
var CONSUMER_KEY = process.env.consumer_key;    // use your app key
var CONSUMER_SECRET = process.env.consumer_secret; // use your app secret
var CALLBACK_URL = process.env.CALLBACK_URL;    // points to your callback endpoint
var AUTHORIZE_URL = 'https://api.xero.com/oauth/Authorize?oauth_token=';

// Xero API defaults to application/xml content-type
var customHeaders = {
  "Accept" : "application/json",
  "Connection": "close"
};

var oauth = new OAuth.OAuth(
    REQUEST_URL,
    ACCESS_URL,
    CONSUMER_KEY,
    CONSUMER_SECRET,
    '1.0A',
    null,
    'HMAC-SHA1',
    null,
    customHeaders
);

// This is important - Xero will redirect to this URL after successful authentication
// and provide the request token as query parameters
oauth._authorize_callback=CALLBACK_URL;

// Initiate the request to Xero to get an oAuth Request Token.
// With the token, we can send the user to Xero's authorize page
exports.requestXeroRequestToken = function(request, response) {

  var deferred = Q.defer();

  console.log("Getting Xero request token.");
  console.log("OAuth: ", oauth);
  oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {

    if (error)
      deferred.reject(error);

    else {
      xeroResponse = {
        token: oauth_token,
        secret: oauth_token_secret
      }
      console.log("Request Token: ", xeroResponse);
      deferred.resolve(xeroResponse);
    }
  });

  return deferred.promise;
};


exports.requestXeroAccessToken = function(request, reply, requestTokens, verifier) {

  var deferred = Q.defer();

  console.log("Getting Xero access token.");

  oauth.getOAuthAccessToken(
      requestTokens.token,
      requestTokens.secret,
      verifier,
      function (error, oauth_access_token, oauth_access_token_secret, results) {

        if (error) {
          deferred.reject(error);
        }

        else {
          var accessTokens = {
            accessToken: oauth_access_token,
            accessSecret: oauth_access_token_secret
          }
          console.log("Access Token: ", accessTokens);
          deferred.resolve(accessTokens);
        }
      }
  );

  return deferred.promise;

};

exports.storeAccessToken = function (accountName, tokens) {

  var table = dynasty.table('tableau_keys');
  console.log("account name: ", accountName);
  console.log("tokens: ", tokens);
  table.insert({
    accountName: accountName,
    accessToken: tokens.accessToken,
    secretToken: tokens.accessSecret
  });
}
