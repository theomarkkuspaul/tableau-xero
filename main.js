
var port = process.env.PORT || 5000;
var xero = require('./src/xeroClient');

const express     = require('express');
const app         = express();
const logger      = require('morgan');
const url         = require('url');
const queryString = require('querystring');
const session     = require('express-session');
const bodyParser  = require('body-parser');

// Parse request body JSON
app.use(bodyParser.json());

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Log to the console for each request to the server.
app.use(logger('combined'));

// assume 404 since no middleware responded
// app.use(function(req, res, next){
//   res.status(404).render('404', { url: req.originalUrl });
// });

// Session handling
app.use(session({resave: true, saveUninitialized: true, secret: "hot curry"}));

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// serve content
app.use(express.static('public'))

// set directory for views
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/connect', function(req, res){
  res.render('authentication');
})

app.post('/authenticate', function(req, res){
  xero.requestXeroRequestToken(req, res).then(function(tokens) {
    console.log("tokens: ", tokens);
    req.session.xero = tokens
    req.session.xero.accountName = req.body.accountName;
    res.send(tokens);
  }, function(err) {
    console.error(err);
    res.send(err);
  });
});

app.get('/callback', function(req, res) {
  var callbackURL = url.parse(req.url);
  var query = queryString.parse(callbackURL.query);

  xero.requestXeroAccessToken(req, res, req.session.xero, query.oauth_verifier).then(function(accessTokens){
    console.log("Access Tokens: ", accessTokens);
    xero.storeAccessToken(req.session.xero.accountName, accessTokens)
    var endpoint = process.env.endpoint;
    var accountName = req.session.xero.accountName;

    var dataEndpoint = endpoint + "/data?accountName=" + req.session.xero.accountName;

    res.render('callback', {dataEndpoint: dataEndpoint});
  }, function(err){
    res.send(err);
  })

});

app.get('/data', function(req, res) {
  var URL = url.parse(req.url);
  var query = queryString.parse(URL.query);
  res.render('tableau', {accountName: query.accountName});
})

app.listen(port, function(){
  console.log("Server listening on ", port);
})


// "https://r3k6ja6cl0.execute-api.ap-southeast-2.amazonaws.com/Prod/xero?accountName=