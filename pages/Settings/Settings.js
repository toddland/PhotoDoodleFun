//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    var ai = Microsoft.ApplicationInsights;

    var page = WinJS.UI.Pages.define("/pages/Settings/Settings.html", {
        ready: function (element, options) {
           
            window.appInsights = appInsights;
            appInsights.trackPageView("Settings Page");

           // Handle colorchart/settings click
           document.getElementById("colorchart").addEventListener("click", colorchartClick);
            
        },

        unload: function () {
        },

    });

    function enableProjClick(args) {
        appInsights.trackEvent("Enable Projection value changed");

        // Save state to roaming settings
        Windows.Storage.ApplicationData.current.roamingSettings.values["ProjectionEnabled"] = document.getElementById("enableProjectionCB").checked;
        if (Windows.Storage.ApplicationData.current.roamingSettings.values["ProjectionEnabled"])
        {
            onProjectionDisplayAvailableChanged();
        }
        ShowAndTell.createSecondaryWindow();
        ShowAndTell.ListView.SetPhotosListLayout();
        ShowAndTell.ListView.SetVideosListLayout();
    }

    function onProjectionDisplayAvailableChanged(eventArgs) {

        var connectNewDisplayBtn = document.getElementById("displayConnectionBtn"); // display to another device button

        if (Windows.UI.ViewManagement.ProjectionManager.projectionDisplayAvailable == true) {
            connectNewDisplayBtn.style.visibility = "visible";

            var msg = new Windows.UI.Popups.MessageDialog("A selected photo or video will now be shown on a second display if connected. Choose the 'Connect Display' button to manually connect a display.");
            // Show the message dialog
            msg.showAsync();
        }
        else {
            connectNewDisplayBtn.style.visibility = "hidden";

            var msg = new Windows.UI.Popups.MessageDialog("There are no displays available");
            // Show the message dialog
            msg.showAsync();

            document.getElementById("enableProjectionCB").checked = false;
        }
        ShowAndTell.createSecondaryWindow();
    }

    function colorchartClick(event) {
        var chartControl = document.getElementById("colorchart");
        var leftOrigin = chartControl.offsetLeft;
        var topOrigin = chartControl.offsetTop;
        var chartWidth = chartControl.clientWidth;
        var chartHeight = chartControl.clientHeight;
        var cellWidth = (chartWidth / 8);

        var clickXCell = Math.floor((event.clientX - leftOrigin) / cellWidth);
        var clickYCell = 0;
        var colorChoice = chartControl.rows[clickYCell].cells[clickXCell].style.background;

        document.getElementById("app").style.backgroundColor = colorChoice;
        document.getElementById("settingHost").style.backgroundColor = colorChoice;
        var applicationData = Windows.Storage.ApplicationData.current;
        var roamingSettings = applicationData.roamingSettings;

        roamingSettings.values["BackgroundColor"] = colorChoice;
        var titleBar = Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar;
        titleBar.buttonBackgroundColor = { a: 0, r: colorChoice.r, g: colorChoice.g, b: colorChoice.b };
        titleBar.buttonHoverBackgroundColor = titleBar.buttonBackgroundColor;
        titleBar.buttonPressedBackgroundColor = titleBar.buttonBackgroundColor;
        titleBar.buttonInactiveBackgroundColor = titleBar.buttonBackgroundColor;

        appInsights.trackEvent("BackColor Changed");
    }

})();
