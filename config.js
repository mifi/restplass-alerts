// http://www.finn.no/reise/restplasser/?pris=395-5090&lengde=1-13&avreise=22.11.2015-26.11.2015&til=Europa;Kypros&til=Asia;De%20Forente%20Arabiske%20Emirater&til=Asia;Thailand&til=Afrika;Egypt&til=Afrika;Marokko&til=Afrika;Kapp%20Verde&til=Amerika;USA&type=fly&type=spesifisert&type=uspesifisert&fra=OSL&fra=RYG&til=Europa;Spania;Costa%20del%20Sol%20og%20Andalucia&til=Europa;Spania;Tenerife&til=Europa;Spania;Gran%20Canaria&sorter=pris_lms

module.exports = {
  durationMin: 1, // days
  durationMax: 13, // days
  priceMin: 395,
  priceMax: 5090,
  daysInFuture: 7,
  fromPlaces: ['OSL', 'RYG'],
  toPlaces: ['Europa%3BSpania','Europa%3BSpania%3BCosta+del+Sol+og+Andalucia','Europa%3BSpania%3BTenerife','Europa%3BSpania%3BGran+Canaria','Europa%3BKypros','Asia%3BDe+Forente+Arabiske+Emirater','Asia%3BThailand','Afrika%3BEgypt','Afrika%3BMarokko','Afrika%3BKapp+Verde','Amerika%3BUSA'],
  pushover: {
    userToken: 'YOUR USER TOKEN FROM PUSHOVER',
    apiToken: 'YOUR API TOKEN FROM PUSHOVER'
  }
}
