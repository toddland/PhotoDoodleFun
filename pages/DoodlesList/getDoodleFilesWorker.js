(function () {
    "use strict";

    self.onmessage = function (e) {
        getPhotoFiles();
    };

    // Enumerate all of the files in the picked folder and display their storage provider and availability.
    function getPhotoFiles() {

        // Create query options with common query sort order and file type filter.
        var fileTypeFilter = [".d0d"];
        var queryOptions = new Windows.Storage.Search.QueryOptions(Windows.Storage.Search.CommonFileQuery.orderByDate, fileTypeFilter);
        queryOptions.indexerOption = Windows.Storage.Search.IndexerOption.useIndexerWhenAvailable;

        // Set up property prefetch - use the PropertyPrefetchOptions for top-level properties
        // and an array for additional properties.
        queryOptions.setPropertyPrefetch(Windows.Storage.FileProperties.PropertyPrefetchOptions.imageProperties, ["System.GPS.Latitude", "System.GPS.Longitude"]);

        // Query the Pictures library.
        var query = Windows.Storage.KnownFolders.picturesLibrary.createFileQueryWithOptions(queryOptions);
        query.getFilesAsync().done(function (files) {
            // Output the query results
            //If no files, then use a placeholder
            if (files.length == 0) {
                // Perform tasks to handle no files found
                postMessage(0);

            } else {
                // If the photos library has 1 or more files, then gather details and add them to the list
                files.forEach(function (item) {
                    var requestedSize = 200;
                    var thumbnailOptions = Windows.Storage.FileProperties.ThumbnailOptions.useCurrentScale;

                    item.getThumbnailAsync(Windows.Storage.FileProperties.ThumbnailMode.picturesView, requestedSize, thumbnailOptions).done(function (thumbnail) {
                        var itemBlobURL = URL.createObjectURL(item, { oneTimeOnly: false });
                        var photoThumbBlobUrl = itemBlobURL;
                        if (thumbnail) {
                            // if successful, then use the thumb to reduce the memory footprint
                            photoThumbBlobUrl = URL.createObjectURL(thumbnail, { oneTimeOnly: false });
                        }

                        // item.properties.retrievePropertiesAsync(["System.GPS.Latitude", "System.GPS.Longitude"]).done(function (properties) {
                        var photoItem = [{ "title": item.name, "date": item.dateCreated.toDateString(), "latProp": new Float64Array(["50", "26", "53.69109999999644"]), "lonProp": new Float64Array(["119", "12", "16.69750000000935"]), "thumbURL": photoThumbBlobUrl, "itemURL": itemBlobURL }];
                        postMessage({ 7846: photoItem });
                        // });
                    });
                });
            }
        });
    }

})();