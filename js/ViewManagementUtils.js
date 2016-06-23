(function () {
    "use strict";

    WinJS.Namespace.define("ShowAndTell", {

        InitializeViewEvents: InitializeEvents,
        onDisplayConnection: onDisplayConnection,
        createSecondaryWindow: createNewWindow,
        startProjection: startProjection,
        projectionDisplayEnabled: projectionDisplayEnabled,
        SecondaryWindowViewPostMessage: viewPostMessage,
        view: view,
    });


    var ViewManagement = Windows.UI.ViewManagement;

    var projectionDisplayEnabled = false;
    // Create a new view for projecting.
    var view = null;

    function InitializeEvents() {
        // addEventListener syntax
        ViewManagement.ProjectionManager.addEventListener("projectiondisplayavailablechanged", onProjectionDisplayAvailableChanged);
        ViewManagement.ProjectionManager.removeEventListener("projectiondisplayavailablechanged", onProjectionDisplayAvailableChanged);
    }

    function viewPostMessage(data, dataString) {
        if (view == null) {
            createNewWindow();
        }
        ShowAndTell.startProjection();
        view.postMessage(data, dataString);
    }

    function onDisplayConnection(eventArgs) {

        if (Windows.UI.ViewManagement.ProjectionManager.projectionDisplayAvailable == true && projectionDisplayEnabled == false) {

            try {
                view = window.open("ms-appx:///pages/SecondaryView/secondaryView.html", null, "msHideView=yes");
                view.postMessage({ 411: ViewManagement.ApplicationView.getForCurrentView().id }, "*");
            }
            catch (e) {
                view == null;
                appInsights.trackException(e);
            }
            requestAndStartProjection();
        }

        createNewWindow();
    }

    function requestAndStartProjection() {

        // Start projection using the previously created secondary view.
        var pickerLocation = {
            height: 300.0,
            width: 200.0,
            x: 270.0,
            y: 0.0
        };
        try {
            ViewManagement.ProjectionManager.requestStartProjectingAsync(
                MSApp.getViewId(view),
                ViewManagement.ApplicationView.getForCurrentView().id,
                pickerLocation,
                Windows.UI.Popups.Placement.above
            ).done(function () {
                // Re-enable the Start projection button to allow starting again when stop projection from projection window.
                projectionDisplayEnabled = true;
                createNewWindow();
                view.postMessage({ 7845: ShowAndTell.ListView.itemsList._keyMap[1].data.bigPicture }, "*");
                appInsights.trackEvent("Projection Picker UI Shown");
                // Clear out the previous error message if there is any.
            }, function (e) {
                // Re-enable the Start projection button if start projection failed.
                appInsights.trackException(e);
            });
        } catch (e) { appInsights.trackException(e); }
    }

    function onCastingDeviceChosen(eventArgs) {
        var castConnect = eventArgs.detail[0].selectedCastingDevice.createCastingConnection();
        var flipview = document.getElementById("flipview.photo");
        castConnect.source = flipview.GetAsCastingSource();
        castConnect.requestStartCastingAsync().then(function () { createNewWindow(); });
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
        createNewWindow();
    }

    function createNewWindow() {

        if ((Windows.UI.ViewManagement.ProjectionManager.projectionDisplayAvailable == true) && Windows.Storage.ApplicationData.current.roamingSettings.values["ProjectionEnabled"] == true) {
            if (view == null) {
                try {
                    view = window.open("ms-appx:///pages/DoodlePage/DoodlePage.html", null, "msHideView=yes");
                    view.postMessage({ 411: ViewManagement.ApplicationView.getForCurrentView().id }, "*");
                }
                catch (e) {
                    appInsights.trackException(e);
                    view == null;
                }
            }
        }
    }

    function startProjection() {
        // Start projection using the previously created secondary view.
        if (Windows.UI.ViewManagement.ProjectionManager.projectionDisplayAvailable == true && view != null && projectionDisplayEnabled == false) {

            try {
                ViewManagement.ProjectionManager.startProjectingAsync(
                    MSApp.getViewId(view),
                    ViewManagement.ApplicationView.getForCurrentView().id
                ).done(function () {
                    projectionDisplayEnabled = true;
                }, function (e) {
                    appInsights.trackException(e);
                });
            } catch (e) { appInsights.trackException(e); }
        }
    }

    window.addEventListener("message", function (e) {
        if (e.data[911] != null) {
            projectionDisplayEnabled = false;
        }

    }, false);

})();