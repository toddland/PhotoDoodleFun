//// Copyright (c) Microsoft Corporation. All rights reserved

(function activated(eventObject) {

    var item = "images/people/person5.png";
   //   var scenarios = [
   //     { url: "/html/MainPage.html", title: "Show & Tell!" },
   // ];

    //// We insert the title bar as the first element in the body.
    //var customTitleBar;
    //var customTitleBarPromise;
 

    //function addCustomTitleBar() {

    //    if (customTitleBarPromise == null)
    //    {
    //        customTitleBarPromise = WinJS.Promise.wrap();
    //    }
    //    // Wait for the previous operation to complete before starting a new one.
    //    customTitleBarPromise = customTitleBarPromise.then(function() {
    //        if (!customTitleBar) {
    //            var host = document.createElement("div");
    //            document.body.insertBefore(host, document.body.childNodes[0]);
    //            return WinJS.UI.Pages.render("/html/customTitleBar.html", host).then(function (result) {
    //                customTitleBar = result;
    //            });
    //        }
    //    });
    //    return customTitleBarPromise;
    //}

    //function removeCustomTitleBar() {
    //    // Wait for the previous operation to complete before starting a new one.
    //    customTitleBarPromise = customTitleBarPromise.then(function () {
    //        if (customTitleBar) {
    //            customTitleBar.unload();
    //            document.body.removeChild(customTitleBar.element);
    //            customTitleBar = null;
    //        }
    //    });
    //    return customTitleBarPromise;
    //}
   // // Enumerate all of the files in the picked folder and display their storage provider and availability.
   // function getFiles() {
   //     clearOutput();

   //     var search = Windows.Storage.Search;
   //     var fileProperties = Windows.Storage.FileProperties;

   //     // Create query options with common query sort order and file type filter.
   //     var fileTypeFilter = [".jpg", ".png", ".bmp", ".gif"];
   //     var queryOptions = new search.QueryOptions(search.CommonFileQuery.orderByName, fileTypeFilter);

   //     // Set up property prefetch - use the PropertyPrefetchOptions for top-level properties
   //     // and an array for additional properties.
   //     var imageProperties = fileProperties.PropertyPrefetchOptions.imageProperties;
   //     var copyrightProperty = "System.Copyright";
   //     var colorSpaceProperty = "System.Image.ColorSpace";
   //     var additionalProperties = [copyrightProperty, colorSpaceProperty];
   //     // Query the Pictures library.
   //     var query = Windows.Storage.KnownFolders.picturesLibrary.createFileQueryWithOptions(queryOptions);
   //     query.getFilesAsync().done(function (files) {
   //         // Output the query results
   //         files.forEach(function (item) {
   //             if (files.size === 0) {
   //                 // Perform tasks to handle no files found
   //             } else {
   //                 // Create an entry in the list for the item
   //                 var dimensions;
   //                 var copyright;
   //                 var colorSpace;
   //                 var requestedSize = 200;
   //                 var thumbnailOptions = Windows.Storage.FileProperties.ThumbnailOptions.useCurrentScale;
   //                // thumbnailOptions |= Windows.Storage.FileProperties.ThumbnailOptions.returnOnlyIfCached;

   //              //   var photoBlobUrl = URL.createObjectURL(item, { oneTimeOnly: true });
   //              //   ShowAndTell.ListView.itemsList.push({ title: item.name, text: item.displayType, picture: photoBlobUrl, storageFile: item });  // "/images/people/person5.png"

   //                 item.getThumbnailAsync(Windows.Storage.FileProperties.ThumbnailMode.picturesView, requestedSize, thumbnailOptions).done(function (thumbnail) {
   //                     if (thumbnail) {
   //                         var photoBlobUrl = URL.createObjectURL(thumbnail, { oneTimeOnly: true });
   //                         ShowAndTell.ListView.itemsList.push({ title: item.name, text: item.displayType, picture: photoBlobUrl, storageFile: item });
   //                         WinJS.UI.processAll();
   //                     }
   //                 });
   //             }
               
   //         });
   ////         ShowAndTell.ListView.data = ShowAndTell.ListView.itemsList;
   //         var listViewControl = document.getElementById("listView");
   //         listViewControl.addEventListener("iteminvoked", invokePhotoItem);

   //     });
   // }

   // // Enumerate all of the files in the picked folder and display their storage provider and availability.
   // function getVideoFiles() {
   //     clearOutput();

   //     var search = Windows.Storage.Search;
   //     var fileProperties = Windows.Storage.FileProperties;

   //     // Create query options with common query sort order and file type filter.
   //     var fileTypeFilter = [".mp4", ".mkv", ".avi", ".mov"];
   //     var queryOptions = new search.QueryOptions(search.CommonFileQuery.orderByName, fileTypeFilter);

   //     // Query the Pictures library.
   //     var query = Windows.Storage.KnownFolders.videosLibrary.createFileQueryWithOptions(queryOptions);
   //     query.getFilesAsync().done(function (files) {
   //         // Output the query results
   //         files.forEach(function (item) {
   //             if (files.size === 0) {
   //                 // Perform tasks to handle no files found
   //             } else {
   //                 // Create an entry in the list for the item
 

   //                 var requestedSize = 200;
   //                 var thumbnailOptions = Windows.Storage.FileProperties.ThumbnailOptions.useCurrentScale;
   //                    //thumbnailOptions |= Windows.Storage.FileProperties.ThumbnailOptions.returnOnlyIfCached;

   //                 //var photoBlobUrl = URL.createObjectURL(item, { oneTimeOnly: true });
   //                 //ShowAndTell.ListView.dataVideo.push({ title: item.name, text: item.displayType, picture: "/images/people/person5.png", storageFile: item });  // "/images/people/person5.png"

   //                    item.getThumbnailAsync(Windows.Storage.FileProperties.ThumbnailMode.picturesView, requestedSize, thumbnailOptions).done(function (thumbnail) {
   //                        if (thumbnail) {
   //                            var photoBlobUrl = URL.createObjectURL(thumbnail, { oneTimeOnly: true });
   //                            ShowAndTell.ListView.dataVideo.push({ title: item.name, text: item.displayType, picture: photoBlobUrl, storageFile: item });  // "/images/people/person5.png"
   //                            WinJS.UI.processAll();
   //                        }
   //                    });
   //             }

   //         });
   //      //   ShowAndTell.ListView.dataVideo = ShowAndTell.ListView.itemsVideo;
   //         var listViewControl = document.getElementById("listViewVideo");
   //         listViewControl.addEventListener("iteminvoked", invokeVideoItem);

   //     });
   // }


   // function invokePhotoItem(eventObject) {

   //     eventObject.detail.itemPromise.done(function (invokedItem) {
   //         var itemData = invokedItem.data.storageFile;
           
   //       //  ShowAndTell.startProjection();
   //     });

   // }

   // function invokeVideoItem(eventObject) {

   //     eventObject.detail.itemPromise.done(function (invokedItem) {
   //         var itemData = invokedItem.data.storageFile;

   //     });

   // }


   // function clearOutput() {
   // }


    //WinJS.Namespace.define("ShowAndTellUtils", {
        
    //    selectedContent: item,
    //});
})();