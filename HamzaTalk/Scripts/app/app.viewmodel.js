﻿function AppViewModel(dataModel) {
    // Private state
    var self = this;

    // Private operations
    function cleanUpLocation() {
        window.location.hash = "";

        if (typeof (history.pushState) !== "undefined") {
            history.pushState("", document.title, location.pathname);
        }
    }

    function getFragment() {
        if (window.location.hash.indexOf("#") === 0) {
            return parseQueryString(window.location.hash.substr(1));
        } else {
            return {};
        }
    }

    function parseQueryString(queryString) {
        var data = {},
            pairs, pair, separatorIndex, escapedKey, escapedValue, key, value;

        if (queryString === null) {
            return data;
        }

        pairs = queryString.split("&");

        for (var i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            separatorIndex = pair.indexOf("=");

            if (separatorIndex === -1) {
                escapedKey = pair;
                escapedValue = null;
            } else {
                escapedKey = pair.substr(0, separatorIndex);
                escapedValue = pair.substr(separatorIndex + 1);
            }

            key = decodeURIComponent(escapedKey);
            value = decodeURIComponent(escapedValue);

            data[key] = value;
        }

        return data;
    }

    function verifyStateMatch(fragment) {
        var state;

        if (typeof (fragment.access_token) !== "undefined") {
            state = sessionStorage["state"];
            sessionStorage.removeItem("state");

            if (state === null || fragment.state !== state) {
                fragment.error = "invalid_state";
            }
        }
    }

    // Data
    self.Views = {
        Loading: {} // Other views are added dynamically by app.addViewModel(...).
    };

    // UI state
    self.errors = ko.observableArray();
    self.user = ko.observable(null);
    self.view = ko.observable(self.Views.Loading);

    self.loading = ko.computed(function () {
        return self.view() === self.Views.Loading;
    });

    self.loggedIn = ko.computed(function () {
        return self.user() !== null;
    });

    // UI operations
    self.archiveSessionStorageToLocalStorage = function () {
        var backup = {};

        for (var i = 0; i < sessionStorage.length; i++) {
            backup[sessionStorage.key(i)] = sessionStorage[sessionStorage.key(i)];
        }

        localStorage["sessionStorageBackup"] = JSON.stringify(backup);
        sessionStorage.clear();
    };

    self.restoreSessionStorageFromLocalStorage = function () {
        var backupText = localStorage["sessionStorageBackup"],
            backup;

        if (backupText) {
            backup = JSON.parse(backupText);

            for (var key in backup) {
                sessionStorage[key] = backup[key];
            }

            localStorage.removeItem("sessionStorageBackup");
        }
    };

    self.navigateToLoggedIn = function (userName, accessToken, persistent) {
        self.errors.removeAll();

        if (accessToken) {
            dataModel.setAccessToken(accessToken, persistent)
        }

        self.user(new UserInfoViewModel(self, userName, dataModel));
        self.navigateToHome();
    };

    self.navigateToLoggedOff = function () {
        self.errors.removeAll();
        dataModel.clearAccessToken();
        self.navigateToLogin();
    };

    // Other navigateToX functions are added dynamically by app.addViewModel(...).

    // Other operations
    self.addViewModel = function (options) {
        var viewItem = {},
            navigator;

        // Add view to AppViewModel.Views enum (for example, app.Views.Home).
        self.Views[options.name] = viewItem;

        // Add binding member to AppViewModel (for example, app.home);
        self[options.bindingMemberName] = ko.computed(function () {
            if (self.view() !== viewItem) {
                return null;
            }

            return new options.factory(self, dataModel);
        });

        if (typeof (options.navigatorFactory) !== "undefined") {
            navigator = options.navigatorFactory(self, dataModel);
        } else {
            navigator = function () {
                self.errors.removeAll();
                self.view(viewItem);
            };
        }

        // Add navigation member to AppViewModel (for example, app.NavigateToHome());
        self["navigateTo" + options.name] = navigator;
    };

    self.initialize = function() {

    };
}

var app = new AppViewModel(new AppDataModel());
