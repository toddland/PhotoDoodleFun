//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";
    var PHOTOMESSAGECONST = 7846;
    var getFilesWorker;
    var getFilesRunning = false;
    var Items = new WinJS.Binding.List([]);
    var initialImageSet = false;

    WinJS.Namespace.define("ShowAndTell.ListViewDoodles", {
        data: Items,
    });
    function addPhotoItem(e) {

        if (e.data == 0) {
            // The URI string
            var uriImage = "ms-appx:///images/smalllogo.png";
            var itemBlobURL = uriImage;
            var photoItem = [{ "title": "No photos found", "date": "Not Available", "latProp": new Float64Array(["50", "26", "53.69109999999644"]), "lonProp": new Float64Array(["119", "12", "16.69750000000935"]), "thumbURL": itemBlobURL, "itemURL": itemBlobURL }];
            ShowAndTell.ListViewDoodles.data.push({ title: photoItem[0].title, text: photoItem[0].date, picture: photoItem[0].thumbURL, bigPicture: photoItem[0].itemURL });
        }
        else if (e.data[PHOTOMESSAGECONST] != null) {
            var item = e.data[PHOTOMESSAGECONST];

            // Create puahpin for the item
            //   ShowAndTell.Map.addPushpin(item[0].latProp, item[0].lonProp, item[0].title, item[0].date);
            // Create an entry in the list for the item
            ShowAndTell.ListViewDoodles.data.push({ title: item[0].title, text: item[0].date, picture: item[0].thumbURL, bigPicture: item[0].itemURL });
            if (initialImageSet == false) {
                CreateXMLTileUpdater(item[0].thumbURL);
                initialImageSet = true;
            }
        }
    }

    var page = WinJS.UI.Pages.define("/pages/DoodlesList/DoodlesList.html", {
        ready: function (element, options) {

            window.appInsights = appInsights;
            appInsights.trackPageView("DoodlesList Page");

            //handle resizes to dhelp determine layouts of pages
            window.addEventListener("resize", onresize);

            if (ShowAndTell.ListView.data.length == 0) {
                getFilesWorker = new Worker('/pages/DoodlesList/getDoodleFilesWorker.js');
                getFilesWorker.postMessage(2);
                getFilesWorker.onmessage = addPhotoItem;
                getFilesRunning = true;
            }

            var listViewControl = document.getElementById("listViewDoodle");
            listViewControl.addEventListener("iteminvoked", invokePhotoItem);

            WinJS.UI.processAll();

            onresize();
        },

        unload: function () {
            if (getFilesWorker) {
                getFilesWorker.terminate();
            }
        },

    });

    function onresize() {
   
    }

    function invokePhotoItem(eventObject) {

        eventObject.detail.itemPromise.done(function (invokedItem) {
            if (invokedItem.data.bigPicture != null) {

                WinJS.Navigation.navigate("/pages/DoodlePage/DoodlePage.html");

            }
            else {
                var msg = new Windows.UI.Popups.MessageDialog("TThe selected item cannot be shown.");
                // Show the message dialog
                msg.showAsync();
            }
        });

    }

    function CreateXMLTileUpdater(photoFile) {

        var Notifications = Windows.UI.Notifications;
        var localFolder = Windows.Storage.ApplicationData.current.localFolder;
        var image = new Image();
        // Save a copy of the photo
        try {
            image.src = photoFile;
            image.copyAsync(localFolder, "TileImage.png", Windows.Storage.NameCollisionOption.replaceExisting).done(function () {
                // Get an XML DOM version of a specific template by using getTemplateContent.
                var tileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.TileWideImageCollection);

                // You will need to look at the template documentation to know how many text fields a particular template has.
                var tileAttributes = tileXml.getElementsByTagName("tile");
                var visualAttributes = tileAttributes[0].firstChild;
                var bindingAttributes = visualAttributes.firstChild;

                // Get the image attribute for this template and fill it in.
                var imageNode = bindingAttributes.getElementsByTagName("image");
                imageNode[0].attributes[1].value = "ms-appdata:///local/TileImage.png";

                // Create the notification from the XML.
                var tileNotification = new Notifications.TileNotification(tileXml);

                // Send the notification to the calling app's tile.
                Notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);
            });
        }
        catch (e) {
            appInsights.trackException(e);
        }
    }

})();
