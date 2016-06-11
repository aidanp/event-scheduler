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

    var codeToTitle =
    {
    "7WS":"7 Wonders",
    "775":"1775",
    "8XX":"18XX",
    "989":"1989",
    "ACQ":"Acquire",
    "ACV":"Advanced Civilization",
    "AFK":"Afrika Korps",
    "AGR":"Agricola",
    "ABN":"Air Baron",
    "ALH":"Alhambra",
    "AMR":"Amun Re",
    "A_S":"Arctic Scavengers",
    "ACS":"Atlantic Storm",
    "ATS":"Attack Sub",
    "AUC":"Auction",
    "AUT":"Automobile",
    "A&A":"Axis & Allies",
    "B17":"B17",
    "BAR":"Battles of Am Revolution",
    "BWD":"Bitter Woods",
    "BRS":"Brass",
    "BKN":"Breakout Normandy",
    "BRI":"Britannia",
    "CNS":"Can't Stop",
    "CAR":"Carcassonne",
    "COB":"Castles of Burgundy",
    "CMK":"Castles Mad King Ludwig",
    "C&K":"Catan: Cities & Knights",
    "CMS":"Circus Maximus",
    "CBC":"Combat Commander",
    "CCA":"C & C Ancients",
    "CCN":"C & C Napoleonics",
    "CNC":"Concordia",
    "CQP":"Conquest of Paradise",
    "DIP":"Diplomacy",
    "DSP":"Dominant Species",
    "DOM":"Dominion",
    "DUN":"Dune",
    "EGZ":"Egizia",
    "ELF":"Elfenroads",
    "ELG":"El Grande",
    "EPB":"Empire Builder",
    "EOS":"Empire of the Sun",
    "EIS":"Enemy In Sight",
    "E&T":"Euphrat & Tigris",
    "EVL":"Evolution",
    "FI5":"Facts In Five",
    "FIL":"Fire In the Lake",
    "5TR":"Five Tribes",
    "FBS":"Football Strategy",
    "FTP":"For the People",
    "FDE":"Formula De",
    "FMR":"Formula Motor Racing",
    "GBG":"Gettysburg",
    "HRC":"Hannibal",
    "HIS":"Here I Stand",
    "HWD":"History of the World",
    "ING":"Ingenious",
    "IVH":"Ivanhoe",
    "KOT":"King of Tokyo",
    "KRM":"Kremlin",
    "KPR":"Kaiser's Pirates",
    "LID":"Liar's Dice",
    "LWD":"Lords of Waterdeep",
    "LST":"Lost Cities",
    "MMS":"March Madness",
    "M44":"Memoir '44",
    "MOV":"Merchant of Venus",
    "MMW":"Mr Madison's War",
    "NW5":"Napoleonic Wars",
    "NVG":"Navegador",
    "POG":"Paths of Glory",
    "PRC":"Pirate's Cove",
    "PGD":"Power Grid",
    "POF":"Princes of Florence",
    "PRO":"Puerto Rico",
    "RA!":"Ra!",
    "RDG":"Ra; The Dice Game",
    "RBN":"Rail Baron",
    "RRY":"Robo Rally",
    "TRC":"Russian Campaign",
    "RRR":"Russian Railroads",
    "SPG":"Saint Petersburg",
    "SJN":"San Juan",
    "SFR":"Santa Fe Rails",
    "SKG":"Sekigahara",
    "SET":"Settlers of Catan",
    "SLS":"Slapshot",
    "SCT":"Speed Circuit",
    "SPD":"Splendor",
    "SQL":"Squad Leader",
    "SWM":"Star Wars Miniatures",
    "QGB":"Star Wars: Queen's Gambit",
    "SCC":"Stockcar Championship Racing",
    "STA":"Stone Age",
    "SSB":"Superstar Baseball",
    "AGE":"Through the Ages",
    "T_G":"Tin Goose",
    "T&T":"Thurn & Taxis",
    "TTR":"Ticket To Ride",
    "TTN":"Titan",
    "TT2":"Titan Two",
    "TTA":"Titan: The Arena",
    "TWS":"Twilight Struggle",
    "TZK":"Tzolkin'",
    "UPF":"Up Front",
    "VSD":"Vegas Showdown",
    "VIE":"Victory in Europe",
    "VIP":"Victory in the Pacific",
    "VGQ":"Virgin Queen",
    "WAS":"War At Sea",
    "WOR":"War of the Ring",
    "WWR":"Washington's War",
    "WAT":"Waterloo",
    "WLL":"Wellington",
    "WNW":"Wilderness War",
    "WSM":"Wooden Ships & Iron Men",
    "WAW":"World At War",
    "YSP":"Yspahan",
    "7WD":"7 Wonders Duel",
    "AOA":"Ace of Aces",
    "ADV":"Adel Verpflichtet",
    "AOR":"Age of Renaissance",
    "BCY":"Battle Cry",
    "BAT":"Battleline",
    "ELC":"Elchfest",
    "GCA":"Great Campaigns ACW",
    "HOS":"Hammer of the Scots",
    "IOV":"Innovation",
    "LHV":"Le Havre",
    "LLM":"Leaping Lemmings",
    "MED":"Medici",
    "MMA":"Monsters Menace America",
    "NVW":"Naval War",
    "PGF":"Pro Golf",
    "RFG":"Race For the Galaxy",
    "RGD":"Roll For the Galaxy",
    "SMW":"Small World",
    "TAM":"Trans America",
    "UNP":"Union Pacific",
    "WPS":"Win, Place & Show",
    "CHL":"Churchill",
    "PZB":"Panzerblitz",
    "LBY":"Labyrinth",
    "GXY":"Galaxy",
    "PDT":"Paydirt",
    "SGM":"Sergeants Miniatures Game",
    "MGW":"Mage Wars",
    "MAN":"Manoeuvre",
    "JUC":"Julius Caesar",
    "TIM":"Tigers in the Mist",
    "ROR":"Republic of Rome",
    "LAS":"Las Vegas",
    "GXT":"Galaxy Trucker",
    "COH":"Conflict of Heroes",
  };

  var titleToCode = {};
  for ( var code in codeToTitle ) {
    titleToCode[normalize(codeToTitle[code])] = code;
  }

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
        $http.get('assets/2016.js').
          success(function(data, status, headers, config) {
            var item;
            var index;
            var events;
            var codeToEvents = {};
            for ( var i in data ) {
              item = data[i];
              item.summary = item.event;
              item.title = item.event;
              if ( item.format !== 'Sales' && item.format !== 'Meeting'
                && item.format !== 'OG' && item.format !== 'Sign-In' ) {
                // split title from round
                index = item.event.lastIndexOf(' ');
                if (index !== -1) {
                  item.title = item.event.substring(0,index);
                  item.round = item.event.substring(index);
                } else {
                  console.log('Could not parse event:', item.event);
                }
              }

              // handling for duration of continuous events
              if (item.continuous === 'Y') {
                var digit = item.summary[item.summary.length-1];
                digit = parseInt(digit);
                // if is digit
                if (!isNaN(digit)) {
                  item.duration = item.duration * digit;
                } else {
                  item.duration = item.duration * 2;
                }
              }

              // handling for juniors events: should all be two hours
              if (item.summary.indexOf('JR') === 0) {
                item.duration = 2;
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

              item.code = getCodeForTitle(item.title);
              if ( !item.code ) {
                // if ( item.title == 'Russian Railroads' ) {
                  console.log('Could not find code:', item.title);
                // }
                item.code = item.title;
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
