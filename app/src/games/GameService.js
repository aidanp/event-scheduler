(function(){
  'use strict';

  angular.module('games')
         .service('gameService', ['$q', '$http', GameService]);

  /**
   * Games DataService
   * Uses embedded, hard-coded data model; acts asynchronously to simulate
   * remote data service call(s).
   *
   * @returns {{loadAll: Function}}
   * @constructor
   */
  function GameService($q, $http){
    var games = [];

        // name: 'Gani Ferrer',
        // avatar: 'svg-6',
        // content: "Lebowski ipsum yeah? What do you think happens when you get rad? You turn in your library card? Get a new driver's license? Stop being awesome? Dolor sit amet, consectetur adipiscing elit praesent ac magna justo pellentesque ac lectus. You don't go out and make a living dressed like that in the middle of a weekday. Quis elit blandit fringilla a ut turpis praesent felis ligula, malesuada suscipit malesuada."

    // Promise-based API
    return {
      loadAllGames : function() {
        return $q(function(resolve, reject) {
        $http.get('assets/all-in-one.ics').
          success(function(data, status, headers, config) {

            var dictionary = {};

            // this callback will be called asynchronously
            // when the response is available
            var jcalData = ICAL.parse(data);
            var vcalendar = new ICAL.Component(jcalData);
            var vevents = vcalendar.getAllSubcomponents('vevent');
            var i, j;
            var event;
            var elements;
            var element;
            for ( i = 0; i < vevents.length; i++ ) {
              event = new ICAL.Event(vevents[i]);
              elements = event.component.jCal[1];
              for ( j = 0; j < elements.length; j++ ) {
                element = elements[j];
                if ( element[0] === 'comment' ) {
                  try {
                  event.properties = JSON.parse(
                    // clean up bad JSON
                    element[3]
        					  .replace(/'/g, '"')
        					  .replace(/False/g,"false")
        					  .replace(/True/g,"true")
        					  .replace(/None/g,"null"));
                  } catch(err) {
                    console.log(err);
                    console.log("COULD NOT PARSE: ");
                    console.log(element[3]);
                  }
                  break;
                }
              }
              var gameid;
              gameid = event.properties.Code;
              var eventlist;
              eventlist = dictionary[gameid];
              if ( !eventlist ) {
                eventlist = [];
                dictionary[gameid] = eventlist;
              }
              eventlist.push(event);

              // translate to US-Eastern timezone if "Z"
              if ( event.startDate.timezone === 'Z' ) {
                event.startDate.hour -= 4;
                event.startDate.timezone = 'UTC−04:00';
              }
              if ( event.endDate.timezone === 'Z' ) {
                event.endDate.hour -= 4;
                event.endDate.timezone = 'UTC−04:00';
              }

            }

            var localevents;
            var summary;
      			for ( i in dictionary ) {
              summary = "";
              localevents = dictionary[i];
              if ( localevents && localevents.length > 0 ) {
                summary = localevents[0].summary;
                j = summary.lastIndexOf(' ');
                if ( j > -1 ) {
                  summary = summary.substring(0,j);
                }
                summary = summary.replace(/DEMO/ig, '');
                summary = summary.replace(/PC/ig, '');
              }
      				games.push({ 'id': i, 'events': dictionary[i], 'summary': summary });
      			}
            games.sort(function(a, b) {
                if ( a.id > b.id ) {
                  return 1;
                } else {
                  return -1;
                }
            });
            resolve(games);
            // var summary = vevent.getFirstPropertyValue('summary');
            // console.log(vcalendar.getAllSubcomponents());
            // console.log("SUCCESS");
            // console.log(summary);

          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log("COULD NOT LOAD SCHEDULE");
            reject([]);
          });
      });
    }
  };
}

})();
