//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // CoreTitleBarHelper is a helper class provided in the CoreViewHelpers project.
    // It allows JavaScript to access properties and events of the
    // CoreApplicationViewTitleBar object.
    var titleBarHelper = CoreViewHelpers.CoreTitleBarHelper.getForCurrentView();
    var titleBarContent;

    var timeOutRetVal = -1;
    var timeoutValue = 500;
    // We insert the title bar as the first element in the body.
    var customTitleBar;
    var customTitleBarPromise;

    var page = WinJS.UI.Pages.define("/pages/CustomTitlebar/customTitleBar.html", {
        ready: function ready(element, options) {
            titleBarContent = element.querySelector("#titleBarContent");
            titleBarHelper.addEventListener("layoutmetricschanged", onLayoutMetricsChanged);
            titleBarHelper.addEventListener("isvisiblechanged", updatePositionAndVisibility);
            // The resize event is raised when the view enters or exits full screen mode.
            window.addEventListener("resize", updatePositionAndVisibility);
            onLayoutMetricsChanged();
            updatePositionAndVisibility();

            if (Storyboard.Utils.timeOutRetVal != -1) {
                clearTimeout(Storyboard.Utils.timeOutRetVal);
            }
            Storyboard.Utils.timeOutRetVal = setTimeout(Storyboard.Utils.showStoryboard, Storyboard.Utils.timeoutValue);
        },
        unload: function unload() {
            titleBarHelper.removeEventListener("layoutmetricschanged", onLayoutMetricsChanged);
            titleBarHelper.removeEventListener("isvisiblechanged", updatePositionAndVisibility);
            window.removeEventListener("resize", updatePositionAndVisibility);
            if (Storyboard.Utils.timeOutRetVal != -1) {
                clearTimeout(Storyboard.Utils.timeOutRetVal);
            }
        }
    });

    function onLayoutMetricsChanged() {
        titleBarContent.style.height = titleBarHelper.height + "px";
        titleBarContent.style.paddingLeft = titleBarHelper.systemOverlayLeftInset + "px";
        titleBarContent.style.paddingRight = titleBarHelper.systemOverlayRightInset + "px";
    }

    // The title bar is the first child of the body.
    //
    // When not in full screen mode, the DOM looks like this:
    //
    //      <body>
    //          <div style="display: block; position: relative">Custom-rendered title bar</div>
    //          Rest of content
    //      </body>
    //
    // Relative position causes the title bar to push the rest of the content down.
    //
    // In full screen mode, the the DOM looks like this:
    //
    //      <body>
    //          <div style="display: block -or- none; position: absolute">Custom-rendered title bar</div>
    //          Rest of content
    //      </body>
    //
    // Absolute position causes the title bar to overlay the rest of the content.
    // The title bar is either display:block or display:none, depending on the value of the isVisible property.

    function updatePositionAndVisibility() {

        if (Windows.UI.ViewManagement.ApplicationView.getForCurrentView().isFullScreenMode) {
            // In full screen mode, the title bar overlays the content.
            // and might or might not be visible.
            titleBarContent.style.backgroundColor = document.getElementById("app").style.backgroundColor;
            titleBarContent.style.display = titleBarHelper.isVisible ? "block" : "none";
            titleBarContent.style.position = "absolute";
        } else {
            // When not in full screen mode, the title bar is visible and does not overlay content.
            titleBarContent.style.backgroundColor = document.getElementById("app").style.backgroundColor;
            titleBarContent.style.display = "block";
            titleBarContent.style.position = "relative";
        }
    }

    function runCustomShowStoryboard() {

        if (contentHost.clientWidth >= 500) {
            WinJS.UI.Animation.enterContent(document.getElementById("Title1"), null).done(function () {
                WinJS.UI.Animation.enterContent(document.getElementById("Title2"), null).done(function () {
                    if (timeOutRetVal != -1) {
                        clearTimeout(timeOutRetVal);
                    }
                    timeoutValue = 4000;
                    timeOutRetVal = setTimeout(runCustomHideStoryboard, timeoutValue);
                    WinJS.UI.Animation.enterContent(document.getElementById("Title3"), null);
                });
            });
        }
    }

    function runCustomHideStoryboard() {

        WinJS.UI.Animation.exitContent(document.getElementById("Title3"), null).done(function () {
            WinJS.UI.Animation.exitContent(document.getElementById("Title2"), null).done(function () {
                WinJS.UI.Animation.exitContent(document.getElementById("Title1"), null);
                if (timeOutRetVal != -1) {
                    clearTimeout(timeOutRetVal);
                }
                timeOutRetVal = setTimeout(runCustomShowStoryboard, timeoutValue);
            });
        });
    }

    function onExtendView() {
        var extend = true;
        var applicationData = Windows.Storage.ApplicationData.current;

        var roamingSettings = applicationData.roamingSettings;

        var backColor = roamingSettings.values["BackgroundColor"];
        if (backColor) {
            document.getElementById("app").style.backgroundColor = backColor;
            var titleBar = Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar;
            titleBar.buttonBackgroundColor = { a: 0, r: backColor.r, g: backColor.g, b: backColor.b };
            titleBar.buttonHoverBackgroundColor = titleBar.buttonBackgroundColor;
            titleBar.buttonPressedBackgroundColor = titleBar.buttonBackgroundColor;
            titleBar.buttonInactiveBackgroundColor = titleBar.buttonBackgroundColor;

        }

        titleBarHelper.extendViewIntoTitleBar = extend;
        if (extend) {
            addCustomTitleBar().done();
        } else {
            removeCustomTitleBar().done();
        }
    }

    function addCustomTitleBar() {

        if (customTitleBarPromise == null) {
            customTitleBarPromise = WinJS.Promise.wrap();
        }
        // Wait for the previous operation to complete before starting a new one.
        customTitleBarPromise = customTitleBarPromise.then(function () {
            if (!customTitleBar) {
                var host = document.createElement("div");
                document.body.insertBefore(host, document.body.childNodes[0]);
                return WinJS.UI.Pages.render("/pages/CustomTitlebar/customTitleBar.html", host).then(function (result) {
                    customTitleBar = result;
                });
            }
        });
        return customTitleBarPromise;
    }

    function removeCustomTitleBar() {
        // Wait for the previous operation to complete before starting a new one.
        customTitleBarPromise = customTitleBarPromise.then(function () {
            if (customTitleBar) {
                customTitleBar.unload();
                document.body.removeChild(customTitleBar.element);
                customTitleBar = null;
            }
        });
        return customTitleBarPromise;
    }

    WinJS.Namespace.define("Storyboard.Utils", {
        showStoryboard: runCustomShowStoryboard,
        hideStoryboard: runCustomHideStoryboard,
        timeOutRetVal: timeOutRetVal,
        timeoutValue: timeoutValue,
    });

    WinJS.Namespace.define("CustomTitlebar.Utils", {
        onExtendView: onExtendView,
    });

})();
