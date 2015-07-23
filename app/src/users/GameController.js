(function(){

  angular
       .module('games')
       .controller('GameController', [
          'gameService', '$mdSidenav', '$mdBottomSheet', '$log', '$q',
          GameController
       ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function GameController( gameService, $mdSidenav, $mdBottomSheet, $log, $q) {
    var self = this;

    self.selected     = null;
    self.games        = [ ];
    self.selectGame   = selectGame;
    self.toggleList   = toggleGamesList;
    self.showContactOptions  = showContactOptions;

    // Load all registered games

    gameService
          .loadAllGames()
          .then( function( games ) {
            self.games    = [].concat(games);
            self.selected = games[0];
          });

    // *********************************
    // Internal methods
    // *********************************

    /**
     * First hide the bottomsheet IF visible, then
     * hide or Show the 'left' sideNav area
     */
    function toggleGamesList() {
      var pending = $mdBottomSheet.hide() || $q.when(true);

      pending.then(function(){
        $mdSidenav('left').toggle();
      });
    }

    /**
     * Select the current avatars
     * @param menuId
     */
    function selectGame ( game ) {
      self.selected = angular.isNumber(game) ? $scope.games[game] : game;
      self.toggleList();
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
