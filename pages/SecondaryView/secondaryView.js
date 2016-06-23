//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    var ViewManagement = Windows.UI.ViewManagement;
    var canvasItem;
    var canvasContext;
    var textLabel;
    var currentFileName;
    var imageFile;
    var parentView = null;
    // Create a ready handler for stop projection button.
    var stopProjectionButton;
    var appInsights = new Microsoft.ApplicationInsights.AppInsights({ instrumentationKey: "b581cfe8-34e7-41d0-98bb-4d2615d6dfe6", endpointUrl: "http://dc.services.visualstudio.com/v2/track" });

    window.addEventListener("message", function (e) {
        if (e.data[7845] != null) {
            pixBox.style.visibility = "visible";
            videoBox.style.visibility = "hidden";
            setContent(e.data[7845]);
         //   currentFileName = e.data[7845];
        }
        else if (e.data[235] != null) {
            pixBox.style.visibility = "hidden";
            videoBox.style.visibility = "visible";
            setVideoContent(e.data[235]);
        }
        else if (e.data[411] != null) {
            parentView = e.source;
        }
    }, false);

    document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("swapDisplayButton").addEventListener("click", swapDisplays, false);
        stopProjectionButton = document.getElementById("stopProjectionButton");
        stopProjectionButton.addEventListener("click", stopProjection, false);

        //watch for view changes
        Windows.UI.ViewManagement.ApplicationView.getForCurrentView().addEventListener("consolidated", onConsolidated);
        window.addEventListener("resize", onresize);
        onresize();

        // Initially Stop Projection button is enabled.
        stopProjectionButton.disabled = false;

        canvasItem = document.getElementById("pixBox");
        canvasContext = canvasItem.getContext("2d");
        canvasContext.lineWidth = 1;

        if(Windows.UI.ViewManagement.ProjectionManager.projectionDisplayAvailable == false)
        {
            document.getElementById("swapDisplayButton").style.visibility = "hidden";
        }
        else {
            document.getElementById("swapDisplayButton").style.visibility = "visible";
        }

        window.appInsights = appInsights;
        appInsights.trackPageView("Secondary Page");
 
    }, false);

    function onConsolidated(eventArgs) {
        videoItem = document.getElementById("videoBox");
        if (videoItem.readyState == true) {
            videoItem.stop();
        }
        parentView.postMessage({ 911: "consolidated" }, "*");
    }
    function onresize() {
        videoItem = document.getElementById("videoBox");
        var canvasItemDiv = document.getElementById("pixBox");
        var availableImageWidth = contentHost.clientWidth;
        var availableImageHeight = contentHost.clientHeight;

        document.getElementById("videoBox").height = availableImageHeight;
        document.getElementById("videoBox").width = availableImageWidth;
      //  setContent(currentFileName);
    }

    function setVideoContent(videoUrl) {
        videoItem = document.getElementById("videoBox");
        var availableImageWidth = contentHost.clientWidth;
        var availableImageHeight = contentHost.clientHeight;

        videoItem.width = availableImageWidth;
        videoItem.height = availableImageHeight;
        videoItem.autoplay = true;
        videoItem.src = videoUrl;
        videoItem.play();
    }

    function setContent(photoBlobUrl) {

        var cat = new Image();

        if (photoBlobUrl != null) {
            onresize();
            cat.src = photoBlobUrl;
        }

        cat.onload = function () {
            // pass one
            var availableImageWidth = contentHost.clientWidth;
            var availableImageHeight = contentHost.clientHeight;

            if (cat.width > cat.height) {

                var NewImagemultiplier = availableImageWidth / cat.width;
                canvasItem.width = cat.width * NewImagemultiplier;
                canvasItem.height = cat.height * NewImagemultiplier;
            }
            else {

                var NewImagemultiplier = availableImageHeight / cat.height;
                canvasItem.width = cat.width * NewImagemultiplier;
                canvasItem.height = cat.height * NewImagemultiplier;
            }

            //center the canvas
            var centerOffsetHeight = ((availableImageHeight - canvasItem.height) / 2);
            var centerOffsetWidth = ((availableImageWidth - canvasItem.width) / 2);

            //draw the canvas
            imageFile = cat;

            canvasContext.save();
            canvasContext.clearRect(0, 0, canvasItem.width, canvasItem.height);

            //render photos
            if (imageFile) {
                canvasContext.drawImage(imageFile, 0, 0, canvasItem.width, canvasItem.height);
            }

            var canvasItemDiv = document.getElementById("pixBox");

            // Position the extended splash screen image in the same location as the system splash screen image.
            canvasItemDiv.style.top = 0 + "px";
            canvasItemDiv.style.left = (availableImageWidth - canvasItem.width)/2 + "px";

            canvasContext.restore();
        };
        cat.onerror = function (e) {
            var error = e;
            appInsights.trackException(e);
        };
    }

    function swapDisplays() {
        if (Windows.UI.ViewManagement.ProjectionManager.projectionDisplayAvailable) {
            ViewManagement.ProjectionManager.swapDisplaysForViewsAsync(
                ViewManagement.ApplicationView.getForCurrentView().id,
                MSApp.getViewId(window.opener)
                ).done(null
                , function (e) {
                    appInsights.trackException(e);
                });
            appInsights.trackEvent("Views Swapped");
        }
    }

    function stopProjection() {
        // Disable Stop Projection button to avoid falsely clicking it twice.
        stopProjectionButton.disabled = true;

        ViewManagement.ProjectionManager.stopProjectingAsync(
            ViewManagement.ApplicationView.getForCurrentView().id,
            MSApp.getViewId(window.opener)
        ).done(function () {
            // Re-enable the Stop projection button to allow stop projection when projecting again.
        },
            function (e) {
                // Re-enable the Stop projection button if stop projection failed.
                appInsights.trackException(e);
            });
    }
})();