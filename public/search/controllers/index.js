'use strict';

angular.module('mean.system').controller('ResultController', ['$scope', '$location', 'Global', function ($scope, $location, Global) {
    $scope.global = Global;

    $scope.searchQuery = decodeURI($location.url().substring(8));
}]);
