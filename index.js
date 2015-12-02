var request = require("request");
var _ = require('underscore');
var Promise = require('bluebird');
var moment = require('moment');
var push = require('pushover-notifications');

var config = require('./config');


var p = new push( {
    user: config.pushover.userToken,
    token: config.pushover.apiToken,
    // onerror: function(error) {},
    // update_sounds: true // update the list of sounds every day - will
    // prevent app from exiting.
});

var sendAsync = Promise.promisify(p.send);



// State
var existingOffers = [];


function handleDiffs(diffs) {
  var text = _.chain(diffs).filter(function(diff) {
    return (diff.old == null || diff.old.price > diff.new.price);
  }).map(function(diff) {
    var old = diff.old;
    var newOffer = diff.new;
    return newOffer.country + '/' + newOffer.region + '/' + newOffer.hotelName + ',' + (old != null ? old.price : 'n/a') + '=>' + newOffer.price;
  }).value().join('\n');

  if (text == '') return;
  console.log(text);

  p.send({
      message: text,
      title: 'Nye restplasser',
      sound: 'magic',
      device: 'devicename',
      priority: 1
  });
}

function runRequest() {
  var avreiseDato = moment().format('DD.MM.YYYY') + '-' + moment().add(config.daysInFuture, 'day').format('DD.MM.YYYY');
  var priceRange = config.priceMin + '-' + config.priceMax;
  var duration = config.durationMin + '-' + config.durationMax;
  var fromPlacesStr = _.map(config.fromPlaces, function(it) { return 'fra='+ it; }).join('&');
  var toPlacesStr = _.map(config.fromPlaces, function(it) { return 'til='+ it; }).join('&');

  var url = 'http://www.finn.no/reise/restplasser/result.json?pris=' + priceRange + '&lengde=' + duration + '&avreise=' + avreiseDato + '&type=fly&type=spesifisert&type=uspesifisert&' + fromPlacesStr + '&' + toPlacesStr + '&sorter=pris_lms';
  //var url = 'http://localhost:8080/test.json';

  console.log('Running ' + new Date() + ' ' + url);

  request({
    uri: url,
  }, function(error, response, body) {
    try {
      var json = JSON.parse(body);

      var offers = json.offers;

      console.log(_.pluck(offers, 'offerId').join(','));

      // Skip checking the first time
      if (existingOffers.length > 0) {
        var offerDiffs = _.map(offers, function(it) {
          var index = _.pluck(existingOffers, 'offerId').indexOf(it.offerId);

          return {
            old: index > -1 ? existingOffers[index] : null,
            new: it
          };
        });

        handleDiffs(offerDiffs);
      }

      _.each(offers, function(it) {
        var index = _.pluck(existingOffers, 'offerId').indexOf(it.offerId);
        if (index > -1) existingOffers[index] = it;
        else existingOffers.push(it);
      });

      //Todo cleanup old offers

      //testing
      //existingOffers.pop();
      //existingOffers[1].price = 1234;
    }
    catch(err) {
      console.log(err.stack);
    }
  });
}


// Test
/*
handleDiffs([
  {
    old: {
       "offerId" : "458c43b71401a523e54122c1ff180020",
       "outboundDepartureTime" : "2015-11-24T00:00:00Z",
       "supplier" : "solfaktor",
       "price" : 2992,
       "hotelName" : "Grand Plaza Hurghada Resort",
       "originCity" : "Oslo",
       "rating" : 4,
       "brand" : "Solfaktor",
       "originAirportCode" : "OSL",
       "type" : null,
       "destination" : "Hurghada",
       "deepLink" : "/reise/restplasser/ut?offerId=458c43b71401a523e54122c1ff180020&destination=Hurghada&region=Hurghada-omr%C3%A5det&country=Egypt&finnrvendor=solfaktor&traveltype=lastminute&finnrprice=2992&searchclickthrough=true",
       "country" : "Egypt",
       "region" : "Hurghada-omr�det",
       "duration" : 8
    },
    new:
      {
         "offerId" : "458c43b71401a523e54122c1ff180020",
         "outboundDepartureTime" : "2015-11-24T00:00:00Z",
         "supplier" : "solfaktor",
         "price" : 1992,
         "hotelName" : "Grand Plaza Hurghada Resort",
         "originCity" : "Oslo",
         "rating" : 4,
         "brand" : "Solfaktor",
         "originAirportCode" : "OSL",
         "type" : null,
         "destination" : "Hurghada",
         "deepLink" : "/reise/restplasser/ut?offerId=458c43b71401a523e54122c1ff180020&destination=Hurghada&region=Hurghada-omr%C3%A5det&country=Egypt&finnrvendor=solfaktor&traveltype=lastminute&finnrprice=2992&searchclickthrough=true",
         "country" : "Egypt",
         "region" : "Hurghada-omr�det",
         "duration" : 8
      }
    },
    {
      old:
    {
       "brand" : "Star Tour",
       "type" : null,
       "originAirportCode" : "OSL",
       "destination" : "Santa Maria",
       "deepLink" : "/reise/restplasser/ut?offerId=8766b14b8f4dfe852dc18f8260fb24a0&destination=Santa+Maria&region=Sal&country=Kapp+Verde&finnrvendor=startour&traveltype=lastminute&finnrprice=2998&searchclickthrough=true",
       "duration" : 8,
       "region" : "Sal",
       "country" : "Kapp Verde",
       "hotelName" : "Kun fly - t/r",
       "originCity" : "Oslo",
       "rating" : 0,
       "outboundDepartureTime" : "2015-11-25T00:00:00Z",
       "supplier" : "startour",
       "price" : 2998,
       "offerId" : "8766b14b8f4dfe852dc18f8260fb24a0"
    },
    new:
    {
       "brand" : "Star Tour",
       "type" : null,
       "originAirportCode" : "OSL",
       "destination" : "Santa Maria",
       "deepLink" : "/reise/restplasser/ut?offerId=8766b14b8f4dfe852dc18f8260fb24a0&destination=Santa+Maria&region=Sal&country=Kapp+Verde&finnrvendor=startour&traveltype=lastminute&finnrprice=2998&searchclickthrough=true",
       "duration" : 8,
       "region" : "Sal",
       "country" : "Kapp Verde",
       "hotelName" : "Kun fly - t/r",
       "originCity" : "Oslo",
       "rating" : 0,
       "outboundDepartureTime" : "2015-11-25T00:00:00Z",
       "supplier" : "startour",
       "price" : 2898,
       "offerId" : "8766b14b8f4dfe852dc18f8260fb24a0"
    }
  }
]);

return;
*/

setInterval(runRequest, config.pollInterval*1000);
//setInterval(runRequest, 5*1000);

runRequest();
