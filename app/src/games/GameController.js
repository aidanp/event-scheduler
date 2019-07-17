(function(){

  angular
       .module('games')
       .controller('GameController', [
          'gameService', '$mdSidenav', '$mdDialog', '$mdBottomSheet', '$log', '$q',
          GameController
       ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function GameController( gameService, $mdSidenav, $mdDialog, $mdBottomSheet, $log, $q) {
    var self = this;

    self.onSwipeLeft = onSwipeLeft;
    self.selectedList = readSelected();
    self.reservedList = [];
    self.allGames = {};
    self.games = [];
    self.undo = undo;
    self.toggleCompact = toggleCompact;
    self.toggleGame = toggleGame;
    self.getEventsForDay = getEventsForDay;
    self.getRowsForDay = getRowsForDay;
    self.isSelected = isSelected;
    self.isGame = isGame;
    self.isJunior = isJunior;
    self.isDemo = isDemo;
    self.getAmPm = getAmPm;
    self.getDayOfWeek = getDayOfWeek;
    self.toggleList   = toggleGamesList;
    self.showMap = showMap;
    self.exportCalendar   = exportCalendar;
    self.showContactOptions  = showContactOptions;
    self.extractRoundFromDescription  = extractRoundFromDescription;
    self.extractRoundNumberFromRound = extractRoundNumberFromRound;
    self.selectAll = selectAll;
    self.clearList = clearList;
    self.openEvent = openEvent;
    self.gameCount = 0;
    // Load all registered games

    var result = gameService
          .loadFromJson();
    result.then( function( games ) {
          var i, game;
          for ( i in games ) {
            self.gameCount = self.gameCount+1;
            game = games[i];
            self.allGames[game.id] = game;
            self.games.push(game);
        }
    });

    // *********************************
    // Internal methods
    // *********************************

    function readSelected() {
      var existing;
      try {
        existing = JSON.parse(localStorage.getItem('persisted'));
        self.layout = localStorage.getItem('layout');
        if (self.layout) {
          self.layout = parseInt(self.layout);
        } else {
          self.layout = 0;
        }
      } catch (e) {
        console.log(e);
      }
      if ( !existing ) {
        existing = [];
      }
      return existing;
    }

    function writeSelected() {
      localStorage.setItem('persisted',JSON.stringify(self.selectedList));
      localStorage.setItem('layout',self.layout);
    }

    function toggleGamesList() {
      var pending = $mdBottomSheet.hide() || $q.when(true);

      pending.then(function(){
        $mdSidenav('left').toggle();
      });
    }

    function toggleCompact() {
      self.layout == 0 ? self.layout = 1 : self.layout = 0;
      localStorage.setItem('layout',self.layout);
    }

    function showMap(ev) {
      var viewer = new ImageViewer.FullScreenViewer();
      viewer.show('assets/program2019-map.png')
    }

    /**
     * Select the current avatars
     * @param menuId
     */
     function toggleGame ( game ) {
       //self.selected = angular.isNumber(game) ? $scope.games[game] : game;
       //self.toggleList();
       var i;
       for ( i in self.selectedList ) {
         if ( self.allGames[self.selectedList[i]] === game ) {
           self.selectedList.splice(i,1);
           writeSelected();
           return;
         }
       }
       self.selectedList.push(game.id);
       self.reservedList = [];
       writeSelected();
     }

     function extractRoundFromDescription(description) {
       if ( description ) {
         var i = description.lastIndexOf('Demo');
         if ( i != -1 ) {
           return description.substring(i);
         }
         i = description.lastIndexOf(' ');
         if ( i != -1 ) {
           return description.substring(i+1);
         }
       }
       return null;
     }

     function extractRoundNumberFromRound(round) {
       if (round) {
         var result = 1;
         round = round.toLowerCase();
         if ( round.indexOf('demo') != -1 ) {
           return 0;
         }
         if ( round === 'qf' ) {
           return 9;
         }
         if ( round === 'sf' ) {
           return 10;
         }
         if ( round === 'sf/f' || round === 'qf/sf/f' ) {
           return 11;
         }
         if ( round === 'f' || round === 'final' ) {
           return 12;
         }
         if (round.charAt(0) == 'r' && round.length>1) {
           return round.charAt(1);
         }
       }
       return 1;
     }

     /**
      * Export to iCal
      */
      function exportCalendar ( ) {
        // collect all events for all days for selected games
        var events = [];
        var i, j;
        var game;
        for ( i in self.selectedList ) {
          game = self.allGames[self.selectedList[i]];
          for ( j in game.events ) {
            events.push(game.events[j].component.jCal);
          }
        }
        if ( events.length > 0 ) {
          var ical = 'BEGIN:VCALENDAR\nVERSION:2.0\n';
          for ( i in events ) {
            ical = ical + ICAL.stringify.component(events[i]) + '\n';
          }
          ical = ical + 'END:VCALENDAR\n';
          console.log(ical);
          //var b64 = btoa(toBin(ical));
          //console.log(b64);
          var url = "data:text/calendar;charset=utf-8,"+encodeURIComponent(ical);
          console.log(url);
          window.open(url);
        }
      }

      function openEvent($event, event) {
        // confusingly named event and $event
        if ($event.detail > 1) {
          // open event preview on double-click
          window.open('http://www.boardgamers.org/wbc17/previews/'+event.code+'.html');
        }
      }

      function selectAll(){
        self.reservedList = self.selectedList;
        self.selectedList = [];
        for (var i in self.allGames) {
          self.selectedList.push(self.allGames[i].id);
        }
        writeSelected();
        console.log(self.selectedList.length, self.allGames.length, Object.keys(self.allGames).length);
      }

      function clearList(){
        self.reservedList = self.selectedList;
        self.selectedList = [];
        writeSelected();
      }

      function undo() {
        self.selectedList = self.reservedList;
        self.reservedList = [];
        writeSelected();
      }

      function onSwipeLeft(){
        self.toggleList();
      }

     /**
      * Returns true if the specified game is in the selected list.
      */
     function isSelected(game) {
       return ( game ? self.selectedList.indexOf(game.id) !== - 1 : false );
     }

     /**
      * Returns true if the specified event is not a non-game event.
      */
     function isGame(event) {
       return ( event.format !== 'Sales' && event.format !== 'Meeting'
         && event.format !== 'OG' && event.format !== 'Sign-In' );
     }

     /**
      * Returns true if the specified event is a juniors event.
      */
     function isJunior(event) {
       return ( event.code == 'JRS' );
     }

     /**
      * Returns true if the specified event is a juniors event.
      */
     function isDemo(event) {
       return ( demoregex.test(event.event) );
     }
     var demoregex = new RegExp("D[0-9]\/[0-9]$");

     /**
      * Returns human readable string for 24-hour hour.
      */
     function getAmPm(hour) {
       if ( hour === 0 ) {
         return "12a";
       }
       if ( hour === 12 ) {
         return "12p";
       }
       if ( hour > 12 ) {
         return (hour-12) + 'p';
       }
       return hour + 'a';
     }

     /**
      * Returns human readable day for day of month.
      * NOTE: hardcoded for WBC 2018, sorry.
      */
     function getDayOfWeek(day) {
       switch (day) {
          case 20: return 'Saturday';
          case 21: return 'Sunday';
          case 22: return 'Monday';
          case 23: return 'Tuesday';
          case 24: return 'Wednesday';
          case 25: return 'Thursday';
          case 26: return 'Friday';
          case 27: return 'Saturday';
          case 28: return 'Sunday';
       }
     }

     function isFinal(game) {
        var i;
        for (i = 0; i < game.events.length; i++) {
          if (game.events[i].summary === (game.summary + " F")) {

          }
        }
     }

    /**
     * Return all events for the specified day of the convention.
     */
    function _getEventsForDay(day) {
      var i, j;
      var game, event;
      var result = [];
      for ( i in self.selectedList ) {
        game = self.allGames[self.selectedList[i]];
        if ( game && game.events ) {
            for ( j in game.events ) {
              event = game.events[j];
              if ( ( event.startDate.day === day && event.startDate.hour > 4 ) ||
                ( event.startDate.hour < 5 && event.startDate.day - 1 == day ) ) {
                result.push(event);
              }
            }
        }
      }
      result.sort(function(a, b) {
          return a.startDate.day*24 + a.startDate.hour - b.startDate.day*24 - b.startDate.hour;
      });
      return result;
    }

    /**
     * Return all events for the specified day of the convention,
     * and calculates expandedRow and condensedRow attributes.
     */
    function getEventsForDay(day) {
      var event, row, existingEvent;
      var a, b;
      var rows = [];
      var events = _getEventsForDay(day);
      for ( i = 0; i < events.length; i++ ) {
        event = events[i];
        event.expandedRow = i;
        for ( j = 0; j < rows.length; j++ ) {
          row = rows[j];
          existingEvent = row[row.length-1]; // last event
          if ( !isJunior(existingEvent) ) {
            // don't allow after juniors
            a = event.time > 6 ? event.time : event.time + 24;
            b = existingEvent.time > 6 ? existingEvent.time : existingEvent.time + 24;
            b = b + existingEvent.duration;
            if ( a > b + 1 ) {
              break;
            }
          }
        }
        if (j === rows.length) {
          // if no existing row found
          row = [];
          rows.push(row);
        }
        row.push(event);
        event.condensedRow = j;
      }
      return events;
    }

    function getRowsForDay(day) {
      var result = 0;
      var events = getEventsForDay(day);
      if (events && events.length > 0) {
        for (var i in events) {
          if (events[i].condensedRow > result) {
            result = events[i].condensedRow;
          }
        }
      }
      return result;
    }


    /**
     * Show the bottom sheet
     */
    function showContactOptions($event) {
        var game = self.selected;

        return $mdBottomSheet.show({
          parent: angular.element(document.getElementById('content')),
          templateUrl: './src/games/view/contactSheet.html',
          controller: [ '$mdBottomSheet', ContactPanelController],
          controllerAs: "cp",
          bindToController : true,
          targetEvent: $event
        }).then(function(clickedItem) {
          clickedItem && $log.debug( clickedItem.name + ' clicked!');
        });

        /**
         * Bottom Sheet controller for the Avatar Actions
         */
        function ContactPanelController( $mdBottomSheet ) {
          this.game = game;
          this.actions = [
            { name: 'Phone'       , icon: 'phone'       , icon_url: 'assets/svg/phone.svg'},
            { name: 'Twitter'     , icon: 'twitter'     , icon_url: 'assets/svg/twitter.svg'},
            { name: 'Google+'     , icon: 'google_plus' , icon_url: 'assets/svg/google_plus.svg'},
            { name: 'Hangout'     , icon: 'hangouts'    , icon_url: 'assets/svg/hangouts.svg'}
          ];
          this.submitContact = function(action) {
            $mdBottomSheet.hide(action);
          };
        }
    }

  }

})();
