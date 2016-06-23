//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    var ai = Microsoft.ApplicationInsights;

    var page = WinJS.UI.Pages.define("/pages/MainPage/MainPage.html", {
        ready: function (element, options) {
           
            window.appInsights = appInsights;
            appInsights.trackPageView("Main Page");
          
            //track when the pivot changes
            var pivotControl = document.getElementById("pivotHeader");
            pivotControl.winControl.addEventListener("selectionchanged", pivotIndexChanged);

            // Add pages to the pivot control
            WinJS.UI.Pages.render("/pages/PhotosList/PhotosList.html", document.getElementById("photoHost"));
           // WinJS.UI.Pages.render("/pages/DoodlesList/DoodlesList.html", document.getElementById("doodleHost"));
            WinJS.UI.Pages.render("/pages/Settings/Settings.html", document.getElementById("settingHost"));
          //  WinJS.UI.Pages.render("/pages/DoodlePage/DoodlePage.html", document.getElementById("doodleCanvasHost"));
          //  document.getElementById("doodleCanvasHost").style.height = "0px";
            // Watch for changes in the number of displays availaible on this machine
            ShowAndTell.InitializeViewEvents();

        },

        unload: function () {
            
        },

    });

    function pivotIndexChanged(eventArgs) {

        if (eventArgs.detail.item._header == "Saved Doodles") {
            document.getElementById("photoHost").style.height = "0px";
            //document.getElementById("doodleHost").style.height = "100%";
            document.getElementById("pivotSettings").style.height = "0px";
            appInsights.trackEvent("Doodles Shown");
        }
        else if (eventArgs.detail.item._header == "Photo Library") {
            document.getElementById("photoHost").style.height = "95%";
            //document.getElementById("doodleHost").style.height = "0px";
            document.getElementById("pivotSettings").style.height = "0px";
            appInsights.trackEvent("Photos Shown");
        }
        else {
            document.getElementById("photoHost").style.height = "0px";
            //document.getElementById("doodleHost").style.height = "0px";
            document.getElementById("pivotSettings").style.height = "100%";
            appInsights.trackEvent("Settings Shown");
        }

        WinJS.UI.processAll();
    }

})();
