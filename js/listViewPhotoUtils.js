(function () {
    "use strict";
    var items = new WinJS.Binding.List([]);

    WinJS.Namespace.define("ShowAndTell.ListView", {
        data: items,
        itemsList: items,
        getFiles: getFiles,
    });

    // Enumerate all of the files in the picked folder and display their storage provider and availability.
    function getFiles() {
        var initialImageSet = false;
        var search = Windows.Storage.Search;
        var fileProperties = Windows.Storage.FileProperties;
        var lonProp;
        var latProp;
        var listViewControl = document.getElementById("listView");

        // Create query options with common query sort order and file type filter.
        var fileTypeFilter = [".jpg", ".png", ".bmp", ".gif"];
        var queryOptions = new search.QueryOptions(search.CommonFileQuery.orderByDate, fileTypeFilter);
        //queryOptions.folderDepth = Windows.Storage.Search.FolderDepth.shallow;
        //queryOptions.indexerOption = Windows.Storage.Search.IndexerOption.useIndexerWhenAvailable;

        // Set up property prefetch - use the PropertyPrefetchOptions for top-level properties
        // and an array for additional properties.
        var imageProperties = fileProperties.PropertyPrefetchOptions.imageProperties;
        var copyrightProperty = "System.Copyright";
        var colorSpaceProperty = "System.Image.ColorSpace";
        var latProperty = "System.GPS.Latitude";
        var lonProperty = "System.GPS.Longitude";
        var additionalProperties = [latProperty, lonProperty];
        queryOptions.setPropertyPrefetch(imageProperties, additionalProperties);

        // Query the Pictures library.
        var query = Windows.Storage.KnownFolders.picturesLibrary.createFileQueryWithOptions(queryOptions);
        query.getFilesAsync().done(function (files) {
            // Output the query results
            if (files.length == 0) {
                // Perform tasks to handle no files found
                ShowAndTell.ListView.itemsList.push({ title: "Pluto", text: "2015", picture: "/images/new-pic-of-pluto.jpg", bigPicture: "/images/new-pic-of-pluto.jpg" });
                ShowAndTell.ListView.itemsList.push({ title: "Jeep", text: "2015", picture: "/images/WP_20140728_21_52_34_Pro.jpg", bigPicture: "/images/WP_20140728_21_52_34_Pro.jpg" });
                var latProp = Float64Array(["50", "26", "53.69109999999644"]);
                var lonProp = Float64Array(["119", "12", "16.69750000000935"]);
                ShowAndTell.Map.addPushpin(latProp, lonProp, "My Photo", "Wed Oct 07 2015");
            } else {
                files.forEach(function (item) {

                    try {
                        item.properties.retrievePropertiesAsync(additionalProperties).done(function (properties) {
                            latProp = (properties[latProperty] ? properties[latProperty] : null);
                            lonProp = (properties[lonProperty] ? properties[lonProperty] : null);
                            var dateTaken = item.dateCreated.toDateString();
                            ShowAndTell.Map.addPushpin(latProp, lonProp, item.name, dateTaken);
                        });
                    }
                    catch (e) {
                        appInsights.trackException(e);
                    }
                    // Create an entry in the list for the item
                    var dimensions;
                    var copyright;
                    var colorSpace;
                    var requestedSize = 200;
                    var thumbnailOptions = Windows.Storage.FileProperties.ThumbnailOptions.useCurrentScale;

                    try {
                        item.getThumbnailAsync(Windows.Storage.FileProperties.ThumbnailMode.picturesView, requestedSize, thumbnailOptions).done(function (thumbnail) {
                            if (thumbnail) {
                                var photoBlobUrl = URL.createObjectURL(thumbnail, { oneTimeOnly: false });
                                var photoBigBlobUrl = URL.createObjectURL(item, { oneTimeOnly: false });
                                var dateTaken = item.dateCreated.toDateString();
                                ShowAndTell.ListView.itemsList.push({ title: item.name, text: dateTaken, picture: photoBlobUrl, bigPicture: photoBigBlobUrl });
                                if (initialImageSet == false) {
                                    CreateXMLTileUpdater(item);
                                    initialImageSet = true;
                                }
                            } else {
                                var photoBigBlobUrl = URL.createObjectURL(item, { oneTimeOnly: false });
                                ShowAndTell.ListView.itemsList.push({ title: item.name, text: item.dateCreated, picture: '/images/smalllogo.png', bigPicture: photoBigBlobUrl });
                            }
                        });
                    }
                    catch (e) {
                        appInsights.trackException(e);
                    }
                });

            }
            listViewControl.addEventListener("iteminvoked", invokePhotoItem);

        });
    }

    function invokePhotoItem(eventObject) {

        eventObject.detail.itemPromise.done(function (invokedItem) {
            if (invokedItem.data.bigPicture != null) {
                if ((ShowAndTell.projectionDisplayAvailable == true || ShowAndTell.projectionDisplayEnabled == true) && Windows.Storage.ApplicationData.current.roamingSettings.values["ProjectionEnabled"] == true) {
                    ShowAndTell.startProjection();
                    ShowAndTell.SecondaryWindowViewPostMessage({ 7845: invokedItem.data.bigPicture }, "*");
                }
                else {
                    var flipViewControl = document.getElementById("flipview.photo");
                    flipViewControl.winControl.currentPage = invokedItem.index;
                    flipViewControl.winControl.forceLayout();
                }
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
        // Save a copy of the photo
        photoFile.copyAsync(localFolder, "TileImage.png", Windows.Storage.NameCollisionOption.replaceExisting).done(function () {
            // Get an XML DOM version of a specific template by using getTemplateContent.
            var tileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.TileWideImageCollection);

            // You will need to look at the template documentation to know how many text fields a particular template has.
            var tileAttributes = tileXml.getElementsByTagName("tile");
            var visualAttributes = tileAttributes[0].firstChild;
            var bindingAttributes = visualAttributes.firstChild;

            // Get the image attribute for this template and fill it in.
            var imageNode = bindingAttributes.getElementsByTagName("image");
            imageNode[0].attributes[1].value = "ms-appdata:///local/TileImage.png";
            //   imageNode[0].attributes[0].firstChild.nodeValue = "Show and Tell!";

            //var imageNode2 = document.createElement("image");
            //imageNode2.setAttribute("src", "images/people/person5.png");
            //bindingAttributes.appendChild(imageNode2);

            // Create the notification from the XML.
            var tileNotification = new Notifications.TileNotification(tileXml);

            // Send the notification to the calling app's tile.
            Notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);
        });
    }

})();