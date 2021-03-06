'use strict';

//Global service for global variables
angular.module('mean.system').factory('Global', [

    function() {
        var _this = this;
        var lang = localStorage.getItem('lang')
        if (!lang)
            lang = 'ko'
        _this._data = {
            user: window.user,
            authenticated: false,
            isAdmin: false,
            lang: lang
        };
        if (window.user && window.user.roles) {
            _this._data.authenticated = window.user.roles.length;
            _this._data.isAdmin = ~window.user.roles.indexOf('admin');
        }
        return _this._data;
    }
]);
