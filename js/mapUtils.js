(function () {
    "use strict";
    var map;
    var MM = Microsoft.Maps;
    var pushPinIndex = 0;
    var pushpinClick;

    WinJS.Namespace.define("ShowAndTell.Map", {
        addPushpin: addPushpin,
        InitializeMap: InitializeMap,
        map: map,
    });

    function InitializeMap() {
        var mapItemDiv = document.getElementById("mapDiv");

        var mapOptions =
         {
             credentials: "fJQVCSuz5cNJv4QjeHLB~3WQzeSJfBf5yPcFOerTsSw~AguRbOEmDmbGz8Q8Iz1iBrfYMIkxMBQkKWGRu243AOKYX6BDc2m-nMZsLKmaSPDa",
             center: new MM.Location(48.06117933094501, -105.00259434789419174),
             //   mapTypeId: "a",
             zoom: 5
         };

        map = new Microsoft.Maps.Map(mapItemDiv, mapOptions);

        //close the infobox when the map is panned or zoomed
        Microsoft.Maps.Events.addHandler(map, 'viewchangestart', closeInfoBox);
    }

    function addPushpin(latVal, longVal, description, dateTaken) {

        if (latVal != null && longVal != null) {
            var latDegreesDecimal = latVal[0] + (latVal[1] / 60.0) + (latVal[2] / 3600.0);
            var lonDegreesDecimal = 0 - longVal[0] + (longVal[1] / 60.0) + (longVal[2] / 3600.0);
            //pushpins
            pushPinIndex++;
            var pushpinOptions = { icon: '/images/pushpin.png' };  //https://i-msdn.sec.s-msft.com/dynimg/IC488534.png
            var pushpin = new MM.Pushpin(new MM.Location(latDegreesDecimal, lonDegreesDecimal), pushpinOptions);

            //extend the pushpin class to store information for popup
            MM.Pushpin.prototype.title = description;
            pushpin.title = description;
            MM.Pushpin.prototype.description = pushPinIndex + "!" + dateTaken;
            pushpin.description = pushPinIndex + "!" + dateTaken;;

            //add a click event
            pushpinClick = MM.Events.addHandler(pushpin, 'click', displayEventInfo);

            if (map) {
                map.entities.push(pushpin);
            }
        }
    }

    function closeInfoBox() {
        var infobox = document.getElementById('infoBox');
        infoBox.style.visibility = "hidden";
    }

    function displayEventInfo(e) {
        if (e.targetType = "pushpin") {
            var indexThumb = e.target.description.substring(0, e.target.description.toString().indexOf("!"));
            var pix = map.tryLocationToPixel(e.target.getLocation(), MM.PixelReference.control);
            var ibTitle = document.getElementById('ibTitle');
            ibTitle.innerHTML = e.target.title;
            var ibDescription = document.getElementById('ibDescription');
            ibDescription.innerHTML = e.target.description.substring(e.target.description.toString().indexOf("!") + 1);
            var infobox = document.getElementById('infoBox');
            infobox.style.top = (pix.y - 20) + "px";
            infoBox.style.left = (pix.x + 5) + "px";
            infoBox.style.visibility = "visible";
            var thumbbox = document.getElementById('thumbImg');
            if (ShowAndTell.ListView.itemsList._keyMap[indexThumb] != null) {
                thumbbox.src = ShowAndTell.ListView.itemsList._keyMap[indexThumb].data.picture;

                document.getElementById('mapDiv').appendChild(infoBox);

                if (ShowAndTell.projectionDisplayAvailable == true || ShowAndTell.projectionDisplayEnabled == true) {
                    if (ShowAndTell.view != null) {
                        ShowAndTell.SecondaryWindowViewPostMessage({ 7845: ShowAndTell.ListView.itemsList._keyMap[indexThumb].data.bigPicture }, "*");
                        ShowAndTell.startProjection();
                    }
                }
                appInsights.trackEvent("Map Pushpin Selected");
            }
        }
    }
})();