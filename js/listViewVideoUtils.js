(function () {
    "use strict";
    var itemsVideo = new WinJS.Binding.List([]);

    WinJS.Namespace.define("ShowAndTell.ListView", {
        dataVideo: itemsVideo,
        itemsVideoList: itemsVideo,
        getVideoFiles: getVideoFiles,
    });

     // Enumerate all of the files in the picked folder and display their storage provider and availability.
    function getVideoFiles() {

        var search = Windows.Storage.Search;
        var fileProperties = Windows.Storage.FileProperties;
        var listViewControl = document.getElementById("listViewVideo");

        // Create query options with common query sort order and file type filter.
        var fileTypeFilter = [".mp4", ".mkv", ".avi", ".mov"];
        var queryOptions = new search.QueryOptions(search.CommonFileQuery.orderByName, fileTypeFilter);

        // Query the Pictures library.
        var query = Windows.Storage.KnownFolders.videosLibrary.createFileQueryWithOptions(queryOptions);
        query.getFilesAsync().done(function (files) {

            if (files.length == 0) {
                // Perform tasks to handle no files found
                ShowAndTell.ListView.dataVideo.push({ title: "No Videos found", text: "Add videos to library", picture: '/images/SplashScreen.scale-200.png', bigPicture: null });
            } else {
                // Output the query results
                files.forEach(function (item) {
                    // Create an entry in the list for the item
                    var requestedSize = 200;
                    var thumbnailOptions = Windows.Storage.FileProperties.ThumbnailOptions.useCurrentScale;
                    var videoBigBlobUrl = URL.createObjectURL(item, { oneTimeOnly: false });

                    // if this is the first time populating the list, set the src of the video element to the first video found
                    var videoBoxControl = document.getElementById("videoBox");
                    videoBoxControl.src = videoBigBlobUrl;

                    item.getThumbnailAsync(Windows.Storage.FileProperties.ThumbnailMode.picturesView, requestedSize, thumbnailOptions).done(function (thumbnail) {
                        if (thumbnail) {
                            var photoBlobUrl = URL.createObjectURL(thumbnail, { oneTimeOnly: false });
                            ShowAndTell.ListView.dataVideo.push({ title: item.name, text: item.dateCreated, picture: photoBlobUrl, bigPicture: videoBigBlobUrl });
                        }
                        else {
                            ShowAndTell.ListView.dataVideo.push({ title: item.name, text: item.dateCreated, picture: '/images/smalllogo.png', bigPicture: videoBigBlobUrl });
                        }
                    });
                });
            }


            listViewControl.addEventListener("iteminvoked", invokeVideoItem);

        });
    }

    function invokeVideoItem(eventObject) {

        eventObject.detail.itemPromise.done(function (invokedItem) {
            if (invokedItem.data.bigPicture != null) {
                if ((Windows.UI.ViewManagement.ProjectionManager.projectionDisplayAvailable == true || ShowAndTell.projectionDisplayEnabled == true) && Windows.Storage.ApplicationData.current.roamingSettings.values["ProjectionEnabled"] == true) {
                    ShowAndTell.SecondaryWindowViewPostMessage({ 235: invokedItem.data.bigPicture }, "*");
                }
                else {
                    var videoBoxControl = document.getElementById("videoBox");
                    videoBoxControl.src = invokedItem.data.bigPicture;

                }
            }
            else {
                var msg = new Windows.UI.Popups.MessageDialog("The selected item cannot be played.");
                // Show the message dialog
                msg.showAsync();
            }
        });
    }

})();