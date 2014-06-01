'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', '$location', 'Global', function ($scope, $location, Global) {
    $scope.global = Global;

    $scope.serachQuery = "";

    $scope.doSearch = function () {
        $location.path('search/' + $scope.searchQuery);
    };

    $scope.doInputSearch = function (event) {
         if (event.which==13)
             $scope.doSearch();
    };
}]);
