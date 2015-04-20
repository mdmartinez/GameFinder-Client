angular.module('gameFinder.controllers', [])

  .controller('LoginCtrl', function($scope, auth, $state, store) {
    function doAuth() {
      auth.signin({
        closable: false,
        // This asks for the refresh token
        // So that the user never has to log in again
        authParams: {
          scope: 'openid offline_access'
        }
      }, function(profile, idToken, accessToken, state, refreshToken) {
        store.set('profile', profile);
        store.set('token', idToken);
        store.set('refreshToken', refreshToken);
        $state.go('app.search');
      }, function(error) {
        console.log("There was an error logging in", error);
      });
    }

    $scope.$on('$ionic.reconnectScope', function() {
      doAuth();
    });

    doAuth();

  })

  .controller('AppCtrl', function($scope, auth, store, $state) {
    $scope.logout = function() {
      auth.signout();
      store.remove('token');
      store.remove('profile');
      store.remove('refreshToken');
      $state.go('login', {}, {reload: true});
    };
  })

  .controller('GameCtrl', function($scope, $http, $stateParams) {
    var url = ['http://gamefinder.herokuapp.com/games/',$stateParams.gameId].join("");

    $http.get(url).success(function(game) {
      $scope.game = game;
      console.log('success!');
    }).error(function(data) {
      console.log('server side error occurred.');
    });
  })

  .controller('SearchCtrl', function($scope, GameService) {

    $scope.search = {};
    $scope.search.searchKey = "";
    $scope.search.libraryList = true;
    $scope.search.gameList = false;

    $scope.clearSearch = function () {
      $scope.search.searchKey = "";
      $scope.findAllItems();
    };

    $scope.searchFunc = function () {
       GameService.findLibrary($scope.search.searchKey).then(function(item) {
        $scope.search.items = item;
      })
    };

    $scope.goBack = function() {
      $scope.search.libraryList = true;
      $scope.search.gameList = false;
      $scope.findAllLibraries();
    }

    $scope.popGames = function(username) {
      GameService.findItems('game',username).then(function (response) {
        $scope.search.gameList = true;
        $scope.search.libraryList = false;
        $scope.search.items = response.data;
      })
    };

    $scope.findAllLibraries = function() {
      GameService.findItems('library').then(function (response) {
        $scope.search.items = response.data;
      })
    };

    $scope.findAllLibraries();

  });

