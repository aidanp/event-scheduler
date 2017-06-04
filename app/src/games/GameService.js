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

    /* Legacy ICAL Format
    BEGIN:VEVENT
    SUMMARY:Registration & Prizes
    DTSTART:20150801T120000Z
    DURATION:PT11H
    COMMENT:{'Format': 'Sign-In'\, 'Code': 'registration'\, 'Continuous': False
     \, 'Prize': None\, 'Class': None}
    CONTACT:Charles Kibler
    DESCRIPTION:registration: Registration & Prizes  (Sign-In)
    LAST-MODIFIED:20150603T015316Z
    LOCATION:New Holland
    URL:
    END:VEVENT

    {
    	"component": ["vevent", [
    			["summary", {}, "text", "Registration & Prizes "],
    			["dtstart", {}, "date-time", "2015-08-01T12:00:00Z"],
    			["duration", {}, "duration", "PT11H"],
    			["comment", {}, "text", "{'Format': 'Sign-In', 'Code': 'registration', 'Continuous': False, 'Prize': None, 'Class': None}"],
    			["contact", {}, "text", "Charles Kibler"],
    			["description", {}, "text", "registration: Registration & Prizes  (Sign-In)"],
    			["last-modified", {}, "date-time", "2015-06-03T01:53:16Z"],
    			["location", {}, "text", "New Holland"],
    			["url", {}, "uri", ""]
    		],
    		[]
    	],
    	"_rangeExceptionCache": {},
    	"exceptions": {},
    	"rangeExceptions": []
    }
    */

  function getCodeForTitle(s) {
    return titleToCode[normalize(s)];
  }

  function normalize(s) {
    if ( s ) {
      return s.replace(/\W+/g, "").toLowerCase();
    } else {
      console.log( 'normalize error', s );
    }
  }

  function convertToLowercase(item) {
    var result = {};
    for ( var i in item ) {
      result[i.toLowerCase()] = item[i];
    }
    return result;
  }

//
// Churchill 	 CHL
// Panzerblitz 	 PZB
// Labyrinth 	 LBY
// The Kaiser's Pirates 	 D: We18, Fr19
// Galaxy 	 GXY
// Paydirt 	 PDT
// Elfenroads 	 D: Th15
// Arctic Scavengers 	 D: TBD
// Tin Goose 	 D: Tu22
// Sergeants Miniatures Game 	 SGM
// Mage Wars 	 MGW
// 1775	 Rebellion
// Manoeuvre 	MAN
// Julius Caesar 	 JUC
// Tigers in the Mist 	 TIM
// Republic of Rome 	 ROR
// Las Vegas 	 LAS
// Galaxy Trucker 	 GXT
// Conflict of Heroes 	 COH

    return {
      loadFromJson: function() {
        return $q(function(resolve, reject) {
        $http.get('assets/2017.json').
          success(function(data, status, headers, config) {
            var item;
            var index;
            var events;
            var codeToEvents = {};
            for ( var i in data ) {
              item = data[i];
              item = convertToLowercase(item);
              item.summary = item.event;
              item.title = item.event;
              // if ( item.format !== 'Sales' && item.format !== 'Meeting'
              //   && item.format !== 'OG' && item.format !== 'Sign-In' ) {
                // split title from round
                index = item.event.lastIndexOf('Demo');
                if (index === -1) {
                  index = item.event.lastIndexOf(' ');
                }
                if (index !== -1) {
                  item.title = item.event.substring(0,index);
                  item.round = item.event.substring(index);
                  //console.log(item.title, '|', item.round);
                } else {
                  console.log('Could not parse event:', item.event);
                }

              item.startDate = new Date(item.date);
              item.startDate.setHours(item.time);
              item.startDate.day = item.startDate.getDate();
              item.startDate.hour = item.startDate.getHours();
              item.startDate.minute = item.startDate.getMinutes();
              item.endDate = new Date(item.date);
              item.endDate.setHours(item.time + parseInt(item.duration));
              item.endDate.day = item.endDate.getDate();
              item.endDate.hour = item.endDate.getHours();
              item.endDate.minute = item.endDate.getMinutes();

              if ( item.code === 'junior' ) {
                // special handling for JR
                item.code = 'JRS';
              }
              events = codeToEvents[item.code];
              if (!events) {
                events = [];
                codeToEvents[item.code] = events;
              }
              events.push(item);
            }

            var game;
            for ( i in codeToEvents ) {
              game = {
                'id': i,
                'events': codeToEvents[i],
              };
              if ( game.events[0].title !== game.id ) {
                game.summary = codeToEvents[i][0].title;
                if ( i === 'JRS' ) {
                  // special handling for JR
                  game.summary = 'Juniors Events';
                }
              }
              games.push(game);
            }
            games.sort(function(a, b) {
                if ( a.id > b.id ) {
                  return 1;
                } else {
                  return -1;
                }
            });
            resolve(games);
          });
        });
      },

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
