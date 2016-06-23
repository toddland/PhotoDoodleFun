(function () {
    "use strict";
    var imageFile;
    var cat = new Image();
//    var notifications = Windows.UI.Notifications;
    var dataTransferManager;
    var savedStyle = null;
    var canvasItem;
    var canvasContext;
    var canvasDiv;
    var penvsEraserMode = true;
    var inkingMode = true;
    var mouseLocX = -1;
    var mouseLocY = -1;
    var enableTapToResize = false;
    var currentFileName = "";

    WinJS.Namespace.define("ShowAndTell.DoodlePage", {
        imageFile: currentFileName,
    });

    var page = WinJS.UI.Pages.define("/pages/DoodlePage/DoodlePage.html", {
        ready: function (element, options) {

        currentFileName = options;
        canvasItem = document.getElementById("imageCanvas");
        canvasContext = canvasItem.getContext("2d");
        canvasContext.lineWidth = 1;
        canvasDiv = document.getElementById("filmstripDiv");

        setView("LEFT");
        setView("0");

        canvasItem.addEventListener("pointerdown", handlePointerDown, false);
        canvasItem.addEventListener("pointerup", handlePointerUp, false);
        canvasItem.addEventListener("pointermove", handlePointerMove, false);
        canvasItem.addEventListener("pointerout", handlePointerOut, false);
  
        setDefaults();

        var backButton = document.getElementById("backBtn");
        backButton.addEventListener("click", clickBack);

        document.getElementById("saveButton").addEventListener("click", clickSave);
        document.getElementById("copyButton").addEventListener("click", clickCopy);
        document.getElementById("PenEraseModeButton").addEventListener("click", clickErase);
        document.getElementById("PenInkModeButton").addEventListener("click", clickPen);
        document.getElementById("PenEraseModeButtonAppBar").addEventListener("click", clickErase);
        document.getElementById("PenInkModeButtonAppBar").addEventListener("click", clickPen);
        document.getElementById("clearButton").addEventListener("click", clearBtnClick);
     
        document.getElementById("widthRange").addEventListener("change", widthRangeClick);
        document.getElementById("widthRange").value = canvasContext.lineWidth;
      
        window.addEventListener("resize", windowSized);

        canvasItem.addEventListener("MSGestureTap", onTableTopGestureTap, false);
        canvasItem.addEventListener("MSPointerDown", onTableTopPointerDown, true);
        canvasItem.addEventListener("MSPointerUp", onTableTopPointerUp, true);
        canvasItem.addEventListener("MSPointerCancel", onTableTopPointerUp, true);

        //
        //  Set up the tabletop position and size; since it will also be manipulable,
        //  position it with a 2D transform as well.
        //
        canvasItem.style.transform = new CSSMatrix();
        canvasItem.gestureObject = new MSGesture(); // expando on element: tracks the tabletop gesture
        canvasItem.gestureObject.target = canvasItem;
        canvasItem.gestureObject.pointerType = null;  // expando on gesture: filter against mixed pointer types
        canvasItem.targetedContacts = [];           // expando on element: list of contacts that target the tabletop
        canvasItem.topmostZ = 3;                      // expando on element: used for quicky and dirty z-reordering

        canvasItem.addEventListener("MSGestureChange", onTableTopGestureChange, false);
        canvasItem.addEventListener("wheel", onMouseWheel, false);
        canvasItem.addEventListener("MSGestureEnd", onTableTopGestureEnd, false);
        canvasItem.addEventListener("MSGestureHold", onTableTopGestureHold, false);

        toggleInkingMode(inkingMode = true);

        document.getElementById('showPanelButton').winControl.selected = true;
        document.getElementById("showPanelButton").addEventListener("click", showPanelClick);

        document.getElementById("Black").addEventListener("click", inkColor);
        document.getElementById("Blue").addEventListener("click", inkColor);
        document.getElementById("Red").addEventListener("click", inkColor);
        document.getElementById("Green").addEventListener("click", inkColor);
        document.getElementById("Lime").addEventListener("click", inkColor);
        document.getElementById("Aqua").addEventListener("click", inkColor);
        document.getElementById("Gold").addEventListener("click", inkColor);
        document.getElementById("White").addEventListener("click", inkColor);

        document.getElementById("contentHost").addEventListener('keyup', function (e) {
            if (e.ctrlKey && e.keyCode === 67) {
                // Invoke copy functionality.
                clickCopy();
            }
        });

        document.getElementById("contentHost").addEventListener('keydown', function (e) {
            var itm = e.srcElement;
            var currentXform = new CSSMatrix(canvasItem.style.transform);
            if (e.keyCode === WinJS.Utilities.Key.upArrow) {
                 //now move to new location
                canvasItem.style.transform = currentXform.
                                   translate(0, -10.0);
            } else if (e.keyCode === WinJS.Utilities.Key.downArrow) {
                canvasItem.style.transform = currentXform.
                                   translate(0, 10.0);
            } else if (e.keyCode === WinJS.Utilities.Key.leftArrow) {
                canvasItem.style.transform = currentXform.
                                   translate(-10.0, 0);
            } else if (e.keyCode === WinJS.Utilities.Key.rightArrow) {
                canvasItem.style.transform = currentXform.
                                   translate(10.0, 0);
            }
        });

        windowSized();

    }
    });
    function showPanelClick(e) {
        if (document.getElementById('showPanelButton').winControl.selected == true) {
            WinJS.UI.Animation.enterContent(document.getElementById("toolPanel"), null).done(function () {
                document.getElementById("toolPanel").style.visibility = "visible";
                document.getElementById("PenEraseModeButtonAppBar").style.visibility = "hidden";
                document.getElementById("PenInkModeButtonAppBar").style.visibility = "hidden";
            });
        }
        else {
            WinJS.UI.Animation.exitContent(document.getElementById("toolPanel"), null).done(function () {
                document.getElementById("toolPanel").style.visibility = "hidden";
                document.getElementById("PenEraseModeButtonAppBar").style.visibility = "visible";
                document.getElementById("PenInkModeButtonAppBar").style.visibility = "visible";
            });

        }
    }

    function windowSized(e) {
        if (contentHost.clientWidth < 500)
        {
            document.getElementById("PenEraseModeButtonAppBar").style.visibility = "visible";
            document.getElementById("PenInkModeButtonAppBar").style.visibility = "visible";
            setView("LEFT");
        }
        else if (inkingMode == false) {
            document.getElementById("PenEraseModeButton").disabled = true;
            document.getElementById("PenInkModeButton").disabled = true;
            document.getElementById("penPreviewContainer").disabled = true;
            document.getElementById("penPreview").opacity = 0.5;
            document.getElementById("widthRange").disabled = true;
            setView("LEFT");
            setView("0");
        }
        else if (inkingMode == true) {
            document.getElementById("PenEraseModeButton").disabled = false;
            document.getElementById("PenInkModeButton").disabled = false;
            document.getElementById("penPreviewContainer").disabled = false;
            document.getElementById("penPreview").opacity = 1.0;
            document.getElementById("widthRange").disabled = false;
            setView("LEFT");
            setView("0");
        }
    }

    function canvasParentClickHandler(e) {
        setView("LEFT");
        setView("0");
    }

    function setView(topMarginOffset) {
        if (topMarginOffset == "LEFT") {
            var currentXform = new CSSMatrix();
            var newLeft = canvasItem.offsetLeft * -1;
            var newTop = canvasItem.offsetTop * -1; 
            //now move to new location
            canvasItem.style.transform = currentXform.translate(0, 0);
        }
        else {
            if (currentFileName) {
                cat = new Image();
                try {
                    var photoBlobUrl = URL.createObjectURL(currentFileName, { oneTimeOnly: true });

                    cat.src = photoBlobUrl;
                }
                catch (e) {
                    cat.src = currentFileName;
                }

                if (cat.complete) {
                    imageLoaded();
                }

                cat.onload = imageLoaded;
                    
            } else {
                imageFile = null;
            }
        }
    }

        function imageLoaded () {
            // pass one
            var availableImageWidth = contentHost.clientWidth - 50; //subract the margin; (contentHost.clientWidth > 320 ? 100 : 0)
            var availableImageHeight = contentHost.clientHeight - 50; //subract the margin

            if (cat.width > cat.height) {

                if (cat.width > availableImageWidth) {
                    //image width is larger than screen
                    var NewImagemultiplier = availableImageWidth / cat.width;
                    canvasItem.width = cat.width * NewImagemultiplier;
                    canvasItem.height = cat.height * NewImagemultiplier;
                }
                else {
                    //image is smaller than screen
                    canvasItem.width = cat.width;
                    canvasItem.height = cat.height;
                }
            }
            else {

                if (cat.height > availableImageHeight) {
                    //image height is larger than screen
                    var NewImagemultiplier = availableImageHeight / cat.height;
                    canvasItem.width = cat.width * NewImagemultiplier;
                    canvasItem.height = cat.height * NewImagemultiplier;
                }
                else {
                    //image is smaller than screen
                    canvasItem.width = cat.width;
                    canvasItem.height = cat.height;
                }
            }

            //center the canvas
           // var centerOffsetHeight = (availableImageHeight/2) - (canvasItem.height/2) - 30;
            //var centerOffsetWidth = (availableImageWidth/2) - (canvasItem.width/2) - 30;

            var currentXform = new CSSMatrix(canvasItem.style.transform);

            //now move to new location
            canvasItem.style.transform = currentXform.translate(0, 0);

            //draw the canvas
            imageFile = cat;
            renderAllCanvasItems();

        }

    function widthRangeClick(event) {
        var rangeValue = event.srcElement.value;
        canvasContext.lineWidth = rangeValue;

        var strokeSize = drawingAttributes.size;
        strokeSize.width = strokeSize.height = canvasContext.lineWidth;
        drawingAttributes.size = strokeSize;

        inkManager.setDefaultDrawingAttributes(drawingAttributes);
        savedStyle = canvasContext.strokeStyle;

    }

    function clickPen(event) {
        penvsEraserMode = true;
        var penPrev = document.getElementById("penPreview");
        savedStyle = canvasContext.strokeStyle = penPrev.style.background;

        var color = drawingAttributes.color;
        drawingAttributes.color = toColorStruct(canvasContext.strokeStyle);
        drawingAttributes.alpha = 255;
        inkManager.setDefaultDrawingAttributes(drawingAttributes);
        savedStyle = canvasContext.strokeStyle;
        inkMode();
        document.getElementById("PenEraseModeButton").winControl.selected = false;
        document.getElementById("PenInkModeButton").winControl.selected = true;

        //appbar versions for snapped
        document.getElementById("PenEraseModeButtonAppBar").winControl.selected = false;
        document.getElementById("PenInkModeButtonAppBar").winControl.selected = true;
    }

    function clickErase(event) {

        penvsEraserMode = false;
        tempEraseMode();
        document.getElementById("PenEraseModeButton").winControl.selected = true;
        document.getElementById("PenInkModeButton").winControl.selected = false;

        //appbar versions for snapped
        document.getElementById("PenEraseModeButtonAppBar").winControl.selected = true;
        document.getElementById("PenInkModeButtonAppBar").winControl.selected = false;
    }

    // Convenience function used by color converters.
    // Assumes arg num is a number (0..255); we convert it into a 2-digit hex string.

    function byteHex(num) {
        var hex = num.toString(16);
        if (hex.length === 1) {
            hex = "0" + hex;
        }
        return hex;
    }

    // Convert from Windows.UI.Input.Inking's color code to html's color hex string.
    function toColorString(color) {
        return "#" + byteHex(color.r) + byteHex(color.g) + byteHex(color.b);
    }

    // Convert from the few color names used in this app to Windows.UI.Input.Inking's color code.
    // If it isn't one of those, then decode the hex string.  Otherwise return gray.
    // The alpha component is always set to full (255).
    function toColorStruct(color) {
        switch (color) {
            // Ink colors
            case "Black":
                return Windows.UI.Colors.black;
            case "Blue":
                return Windows.UI.Colors.blue;
            case "Red":
                return Windows.UI.Colors.red;
            case "Green":
                return Windows.UI.Colors.green;

                // Highlighting colors
            case "Yellow":
                return Windows.UI.Colors.yellow;
            case "Aqua":
                return Windows.UI.Colors.aqua;
            case "Lime":
                return Windows.UI.Colors.lime;

                // Select colors
            case "Gold":
                return Windows.UI.Colors.gold;

            case "White":
                return Windows.UI.Colors.white;
        }

        if ((color.length === 7) && (color.charAt(0) === "#")) {
            var R = parseInt(color.substr(1, 2), 16);
            var G = parseInt(color.substr(3, 2), 16);
            var B = parseInt(color.substr(5, 2), 16);
            return Windows.UI.ColorHelper.fromArgb(255, R, G, B);
        }

        return Windows.UI.Colors.gray;
    }

    function clearBtnClick(event) {
        setDefaults();
     
        renderAllCanvasItems();

        setView("LEFT");
        setView("CENTER");
    }

    function clickCopy(event) {
         var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
         var statusText;

         // Add the selected image to the DataPackage
         var strDataURIBlob = canvasItem.msToBlob();

         dataPackage.setBitmap(Windows.Storage.Streams.RandomAccessStreamReference.createFromStream(strDataURIBlob.msDetachStream()));

         statusText = "Image copied to Clipboard";

        try {
            // copy the content to Clipboard
            Windows.ApplicationModel.DataTransfer.Clipboard.setContent(dataPackage);
            //   displayStatus(statusText);
        } catch (e) {
            // Copying data to Clipboard can potentially fail - for example, if another application is holding Clipboard open
            //    displayError("Error copying content to Clipboard: " + e + ". Try again.");
        }
    }

    function clickSave(event) {
        canvasItem = document.getElementById("imageCanvas");

        var savePicker = new Windows.Storage.Pickers.FileSavePicker();

        savePicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
        savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
        // Users expect to have a filtered view of their folders depending on the scenario.
        // For example, when choosing a documents folder, restrict the filetypes to documents for your application.
        savePicker.suggestedFileName = imageFile.displayName + " Doodled" + imageFile.fileType;
        savePicker.defaultFileExtension = ".jpg";
        savePicker.fileTypeChoices.insert("JPEG files", [".jpg"]);
        savePicker.fileTypeChoices.insert("PNG files", [".png"]);

        savePicker.pickSaveFileAsync().then(function (file) {

            if (file != null) {
                saveCanvas(file.name, canvasItem);
            }
        });
    }

    function clickBack(event) {
        WinJS.Navigation.navigate("/pages/MainPage/MainPage.html");
    }

    function setDefaults() {

        document.getElementById("PenInkModeButton").winControl.selected = true;
        document.getElementById("PenEraseModeButton").winControl.selected = false;
        inkManager = new Windows.UI.Input.Inking.InkManager();
        drawingAttributes = new Windows.UI.Input.Inking.InkDrawingAttributes();

        var strokeSize = drawingAttributes.size;
        strokeSize.width = strokeSize.height = canvasContext.lineWidth = 15;
        canvasContext.lineWidth = strokeSize.width;
        canvasContext.lineCap = "round";
        canvasContext.lineJoin = "round";
        drawingAttributes.size = strokeSize;

        drawingAttributes.fitToCurve = true;

        document.getElementById("penPreview").style.background = canvasContext.strokeStyle = "red";
        document.getElementById("penPreviewContainer").style.background = canvasContext.strokeStyle;
        drawingAttributes.color = toColorStruct(canvasContext.strokeStyle);
        drawingAttributes.alpha = 255;
        inkManager.setDefaultDrawingAttributes(drawingAttributes);
        savedStyle = canvasContext.strokeStyle;
    }

    function shareSourceRequest(e) {

        var data = new Windows.ApplicationModel.DataTransfer.DataPackage();

        //data.properties.thumbnail = Windows.Storage.Streams.RandomAccessStreamReference.createFromStream(strDataURIBlob.msDetachStream());
         
      //  var range = document.createRange();
     //   range.selectNode(document.getElementById("imageCanvas"));
    //    e.request.data = MSApp.createDataPackage(range);
        // The HTML fragment we are using has an image tag that references a local file accessible only to this application.
        // To make sure that target application can render this image, we need to populate a resourceMap as part of the share operation data
        // We use the image's relative src property as the key to the resourceMap item we're adding
      //  e.request.data.resourceMap[path] = Windows.Storage.Streams.RandomAccessStreamReference.createFromStream(strDataURIBlob.msDetachStream());

        var strDataURIBlob = canvasItem.msToBlob();

        data.properties.title = "Photo. Doodle. Fun!"; // Title required
        data.properties.description = "Doodle on your photos to make funny images and share with friends."; // Description optional
        data.setText("Try Photo. Doodle, Fun! from the Windows 8 store at: http://apps.microsoft.com/windows/app/photo-doodle-fun/89d4e31b-147f-49de-810f-dfe39a9f7fb9");
        data.setUri(new Windows.Foundation.Uri("http://apps.microsoft.com/windows/app/photo-doodle-fun/89d4e31b-147f-49de-810f-dfe39a9f7fb9"));
        var streamReference = Windows.Storage.Streams.RandomAccessStreamReference.createFromStream(strDataURIBlob.msDetachStream());
        data.properties.thumbnail = streamReference;
        data.setBitmap(streamReference);

        e.request.data = data;
    }

    function linkClickEventHandler(eventInfo) {
        eventInfo.preventDefault();
        var link = eventInfo.target;
        WinJS.Navigation.navigate(link.href);
    }

    function saveCanvas(filename, canvas) {
        //Open an output stream for filename in the pictures library
        var pictures = Windows.Storage.KnownFolders.picturesLibrary;

        var ctx, imgData;
        var Imaging = Windows.Graphics.Imaging;

        //Create the file
        pictures.createFileAsync(filename, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
            if (file) {
                //Open the created file
                return file.openAsync(Windows.Storage.FileAccessMode.readWrite);
            }
        })
        .then(function (stream) {
            //Get the canvas data
            ctx = canvas.getContext("2d");
            imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            //Create imageencoder object
            return Imaging.BitmapEncoder.createAsync(Imaging.BitmapEncoder.pngEncoderId, stream);
        })
        .then(function (encoder) {
            //Set the pixel data in the encoder
            encoder.setPixelData(Imaging.BitmapPixelFormat.rgba8, Imaging.BitmapAlphaMode.straight,
                canvas.width, canvas.height, 96, 96, new Uint8Array(imgData.data));

            //Go do the encoding
            return encoder.flushAsync();
        })
        .then(null, function (error) {
        });

        return true;
    }


    // Convert from the few color names used in this app to Windows.UI.Input.Inking's color code.
    // If it isn't one of those, then decode the hex string.  Otherwise return gray.
    // This does not include any alpha component.
    // Note the little-endian representation.
    function toColorInt(color) {
        switch (color) {
            // Ink colors
            case "Black":
                return 0x000000;
            case "Blue":
                return 0xFF0000;
            case "Red":
                return 0x0000FF;
            case "Green":
                return 0x008000;

                // Highlighting colors
            case "Yellow":
                return 0x00FFFF;
            case "Aqua":
                return 0xFFFF00;
            case "Lime":
                return 0x00FF00;

                // Select colors
            case "Gold":
                return 0x00D7FF;

            case "White":
                return 0xFFFFFF;
        }

        if ((color.length === 7) && (color.charAt(0) === "#")) {
            var R = parseInt(color.substr(1, 2), 16);
            var G = parseInt(color.substr(3, 2), 16);
            var B = parseInt(color.substr(5, 2), 16);
            return (B << 16) + (G << 8) + R;
        }

        return 0x808080; // Gray
    }

    // Global variables representing the ink interface.
    // The usage of a global variable for drawingAttributes is not completely necessary,
    // just a convenience.  One could always re-fetch the current drawingAttributes
    // from the inkManager.
    var inkManager;
    var drawingAttributes;
   
    var penID = -1;

    // We will accept pen down or mouse left down as the start of a stroke.
    // We will accept touch down or mouse right down as the start of a touch.
    function handlePointerDown(evt) {
        try {
            if (inkingMode == true) {

                if ((evt.pointerType === "touch") || (evt.pointerType === "mouse") || ((evt.pointerType === "pen"))) {
                    var pt = evt.currentPoint;
                    mouseLocX = pt.rawPosition.x;
                    mouseLocY = pt.rawPosition.y;

                    if (pt.properties.isEraser || penvsEraserMode == false) // the back side of a pen, which we treat as an eraser
                    {
                        tempEraseMode();
                    }
                    else {
                        inkMode();
                    }

                    canvasContext.beginPath();
                    canvasContext.moveTo(pt.rawPosition.x, pt.rawPosition.y);

                    inkManager.processPointerDown(pt);
                    penID = evt.pointerId;
                }
            }
            else {
                onMouseWheel(evt);
            }
        }
        catch (e) {
        }
    }
    
    function modeDoodleBtnClick(e) {
        toggleInkingMode(inkingMode = true);
    }
    function modeResizeBtnClick(e) {
        toggleInkingMode(inkingMode = !inkingMode);
    }

    function toggleInkingMode() {

        if (inkingMode == true) {

            if (contentHost.clientWidth >= 500 && document.getElementById("PenEraseModeButton").disabled == true) {
                document.getElementById("PenEraseModeButton").disabled = false;
                document.getElementById("PenInkModeButton").disabled = false;
                document.getElementById("penPreviewContainer").disabled = false;
                document.getElementById("widthRange").disabled = false;
                canvasItem.style.opacity = 1.0;
            }
            canvasItem.style.outline = "none";
        }
        else {

            document.getElementById("PenEraseModeButton").disabled = true;
            document.getElementById("PenInkModeButton").disabled = true;
            document.getElementById("penPreviewContainer").disabled = true;
            document.getElementById("widthRange").disabled = true;
            canvasItem.style.outline = "dashed";
            canvasItem.style.outlineColor = "yellow";
            canvasItem.style.outlineWidth = "10px";
            canvasItem.style.opacity = 0.9;

        }

    }

    function handlePointerMove(evt) {
        try {
            if (inkingMode == true) {
                if (evt.pointerId === penID) {
                    var pt = evt.currentPoint;
                    canvasContext.lineTo(pt.rawPosition.x, pt.rawPosition.y);
                    canvasContext.stroke();
                    inkManager.processPointerUpdate(pt);
                }

            }        }
        catch (e) {
        }
    }

    function handlePointerUp(evt) {
        try {
            var pt = evt.currentPoint;

            if (inkingMode == true) {
                if (mouseLocX == pt.rawPosition.x && mouseLocY == pt.rawPosition.y && enableTapToResize) {
                    toggleInkingMode(inkingMode = !inkingMode);
                }

                if (evt.pointerId === penID) {
                    
                    canvasContext.lineTo(pt.rawPosition.x, pt.rawPosition.y);
                    canvasContext.stroke();
                    canvasContext.closePath();
                    inkManager.processPointerUp(pt);

                    document.getElementById("PenEraseModeButton").disabled = "";

                }

                penID = -1;
                renderAllCanvasItems();
            }
        }
        catch (e) {

        }
            
    }
    // We treat the event of the pen leaving the canvas as the same as the pen lifting;
    // it completes the stroke.
    function handlePointerOut(evt) {
        if (evt.pointerId === penID) {
            var pt = evt.currentPoint;
            canvasContext.lineTo(pt.rawPosition.x, pt.rawPosition.y);
            canvasContext.stroke();
            canvasContext.closePath();
            inkManager.processPointerUp(pt);
            penID = -1;
            renderAllCanvasItems();
        }
    }

    // Redraws (from the beginning) all strokes in the canvases.  All canvases are erased,
    // then the paper is drawn, then all the strokes are drawn.
    function renderAllCanvasItems() {
        canvasContext.save();
        canvasContext.clearRect(0, 0, canvasItem.width, canvasItem.height);

        //render photos
        if (imageFile && imageFile.complete == true) {
            canvasContext.drawImage(imageFile, 0, 0, canvasItem.width, canvasItem.height);
        }

        canvasContext.strokeStyle = savedStyle;
        //render ink
        inkManager.getStrokes().forEach(function (stroke) {
            var att = stroke.drawingAttributes;
            var color = toColorString(att.color);
            var strokeSize = att.size;
            var width = strokeSize.width;

            var ctx = canvasContext;
            renderStroke(stroke, color, width, ctx);

        });

        canvasContext.restore();

    }

    // A button handler which fetches the ID from the button, which should
    // be a color name.  We set the strokeStyle of the inking canvas to this color,
    // then set the system into ink mode (which will cause the ink manager
    // to change its defaults for new strokes to match the ink canvas).
    // If any ink strokes (not including highlight strokes) are currently selected,
    // we also change their color to this value.  If any strokes are changed
    // we must re-render the dirty areas.
    function inkColor(evt) {
        var penPrev = document.getElementById("penPreview");

        penPrev.style.background = evt.currentTarget.id;
        var widthPenRangeParent = document.getElementById("penPreviewContainer");
        widthPenRangeParent.style.background = evt.currentTarget.id;
        savedStyle = canvasContext.strokeStyle = evt.currentTarget.id;

        var color = drawingAttributes.color;

        drawingAttributes.color = toColorStruct(evt.currentTarget.id);
        drawingAttributes.alpha = 255;
        inkManager.setDefaultDrawingAttributes(drawingAttributes);
        savedStyle = canvasContext.strokeStyle;

        inkMode();

        renderAllCanvasItems();
    }

    function inkMode() {
        canvasContext.strokeStyle = savedStyle;
        inkManager.mode = Windows.UI.Input.Inking.InkManipulationMode.inking;

        canvasContext.lineWidth = document.getElementById("widthRange").value;
        canvasContext.lineCap = "round";
        canvasContext.lineJoin = "round";

        var strokeSize = drawingAttributes.size;
        strokeSize.width = strokeSize.height = canvasContext.lineWidth;
        drawingAttributes.size = strokeSize;

        inkManager.setDefaultDrawingAttributes(drawingAttributes);
        savedStyle = canvasContext.strokeStyle;
    }

    function tempEraseMode() {
        savedStyle = canvasContext.strokeStyle;
        canvasContext.strokeStyle = "rgba(256,127,127,1.0)";
        canvasContext.lineWidth = 20;

        var strokeSize = drawingAttributes.size;
        strokeSize.width = strokeSize.height = canvasContext.lineWidth;
        drawingAttributes.size = strokeSize;

        inkManager.setDefaultDrawingAttributes(drawingAttributes);

        canvasContext.lineCap = "square";

        inkManager.mode = inkManager.mode = Windows.UI.Input.Inking.InkManipulationMode.erasing;

    }

    //Draws a single stroke into a specified canvas 2D context, with a specified color and width.
    function renderStroke(stroke, color, width, ctx) {
        ctx.save();

        try {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = width;

            var first = true;
            stroke.getRenderingSegments().forEach(function (segment) {
                if (first) {
                    ctx.moveTo(segment.position.x, segment.position.y);
                    first = false;
                }
                else {
                    ctx.bezierCurveTo(segment.bezierControlPoint1.x, segment.bezierControlPoint1.y,
                                  segment.bezierControlPoint2.x, segment.bezierControlPoint2.y,
                                  segment.position.x, segment.position.y);
                }
            });

            ctx.stroke();
            ctx.closePath();

            ctx.restore();
        }
        catch (e) {
            ctx.restore();
        }
    }

    // Handler for MouseWheel Event 
    function onMouseWheel(e) {
        e.pointerId = 1;                 // Fixed pointerId for MouseWheel
        onTableTopPointerDown(e);
    }

    function onTableTopPointerDown(e) {
        //    Update the tabletop gesture object and gesture handling:
        //    1) The table top gesture object is persistent from load time on, but its pointerType field
        //       is null when there are no contacts
        //    2) pointerType is used to filter additional pointers coming down, since the gesture recognizer
        //       can't handle mixed pointer types, we use the first pointer we see to reject any pointers of
        //       a different type for the duration of the current table top gesture
        //    3) targetedContacts tracks those contacts that actually target the tabletop (as opposed to
        //       a piece).  This is used to decide whether the tabletop responds to the interaction, or 
        //       whether pieces respond to the interaction.
        //
        //    4) **Note**: we need to capture the pointer to the tabletop element so that we're guaranteed to
        //       receive a pointer up; without that, the targeted contacts tracking can be broken. A design
        //       alternative would be to not capture the pointer, but listen for pointerout events to clean
        //       up the contact tracking.

        if (inkingMode == false) {
            if (e.currentTarget.gestureObject.pointerType === null) {               // First contact!
                e.currentTarget.setPointerCapture(e.pointerId);
                e.currentTarget.gestureObject.pointerType = e.pointerType;
                e.currentTarget.gestureObject.addPointer(e.pointerId);
                if (e.target === e.currentTarget) {
                    e.target.targetedContacts.push(e.pointerId);
                }
            }
            else if (e.currentTarget.gestureObject.pointerType === e.pointerType) { // Subsequent contact of similar type!
                e.currentTarget.setPointerCapture(e.pointerId);
                e.currentTarget.gestureObject.addPointer(e.pointerId);
                if (e.target === e.currentTarget) {
                    e.target.targetedContacts.push(e.pointerId);
                }
            }
            else {                                                                  // Subsequent contact of different type!
                return;
            }

            //
            //  Create or update the tile gesture object and handling:
            //    1) Create a gesture, associate it with the pointer target element, contact, and pointer type
            //    2) Add event listeners for gesture events
            //    3) Pop this element to the top of the z-order (quick and dirty algorithm - see comment below)
            //  N.b.: code to defend against mixed pointer type is technically unnecessary since it has already 
            //  filtered above, but that would be relatively fragile, as it depends on the fact that the tabletop
            //  gesture listens to all active contacts.
            //

            if (!e.target.gestureObject) {                                      //  First contact on this element!
                e.target.gestureObject = new MSGesture();
                e.target.gestureObject.target = e.target;
                e.target.gestureObject.pointerType = e.pointerType;
                e.target.addEventListener("MSGestureChange", onPieceGestureChange, false);
                e.target.addEventListener("MSGestureEnd", onPieceGestureEnd, false);
                e.target.addEventListener("MSGestureTap", onPieceGestureTap, false);
                e.target.addEventListener("MSGestureHold", onPieceGestureHold, false);
                e.target.gestureObject.pointerType === e.pointerType;
                e.target.gestureObject.addPointer(e.pointerId);
                e.target.parentElement.topmostZ += 1;
                e.target.style.zIndex = e.target.parentElement.topmostZ;
            }
            else if (e.target.gestureObject.pointerType === e.pointerType) {    // Subsequent contact of same kind!
                e.target.gestureObject.addPointer(e.pointerId);
                //
                //  To pop the element to the top, we just keep track of the topmostZ index, increment it by one,
                //  and assign that value to the target element.  This would eventually wrap around or overflow.
                //  A better algorithm here would test topmostZ against some threshold and, when it is hit, take 
                //  time to remap the zIndex's back to 0 .. n.
                //
                e.target.parentElement.topmostZ += 1;
                e.target.style.zIndex = e.target.parentElement.topmostZ;
            }
        }
    }

    function onTableTopPointerUp(e) {
        //  Called on either pointer up or pointer cancel (which can easily happen to touch if a pen comes in range,
        //  for example.)  Remove the contact from the list of contacts that target the tabletop.

        if (inkingMode == false) {
            var tableTop;
            if (e.target === e.currentTarget) {  // pointer up on the tabletop
                tableTop = e.target;
            }
            else {                               // pointer up on a tile, but it may have originally gone down on the tabletop!
                tableTop = e.target.parentElement;
            }
            var i = tableTop.targetedContacts.indexOf(e.pointerId);
            if (i !== -1) {
                tableTop.targetedContacts.splice(i, 1);
            }
        }
    }

    function onTableTopGestureEnd(e) {
        //  Clear the gesture input pointer type
        e.gestureObject.pointerType = null;
    }

    function onTableTopGestureChange(e) {
        //  Only handle the gesture if table top is the target and 
        //  at least one active contact is targeting the table top:

        if ((e.target === e.currentTarget) && (e.target.targetedContacts.length !== 0)) {
            // Update the scale factor on the container element.  The gesture event contains
            // incremental scale, rotation, and translation since the last event.  Scaling and rotation
            // take place around the gesture "pivot point" (also provided in the gesture event as the
            // offsetX and Y properties). The element must be translated to that point before applying
            // the zoom and rotation, then translated back.  All of these transformations can be
            // concatenated to the current transform, so:
            //   1) Get the current 2D transform and translate it to the pivot point of the gesture
            //   2) Apply incremental translation and scale (by design, no rotation on the table top)
            //   3) Translate back from the pivot point of the gesture
            //
            var currentXform = new CSSMatrix(e.target.style.transform);
            e.target.style.transform = currentXform.
        //        translate(e.offsetX, e.offsetY).
                translate(e.translationX, e.translationY).
             //   rotate(e.rotation * 180 / Math.PI).
                scale(e.scale)//.
      //          translate(-e.offsetX, -e.offsetY)
            ;
        }
    }

    function onTableTopGestureTap(e) {
        if (inkingMode == false) {
            toggleInkingMode(inkingMode = !inkingMode);
        }

        //  Restore original size - if table top is the target and at least one active contact is targeting the table top:
        if ((e.target === e.currentTarget) && (e.target.targetedContacts.length !== 0)) {
  
        }

        //  Tap is similar to End from a cleanup perspective, so clear the gesture input pointer type
        e.gestureObject.pointerType = null;
    }

    function onTableTopGestureHold(e) {
        if (e.detail === e.MSGESTURE_FLAG_END) {
            //  Restore tabletop and all the pieces:
            if ((e.target === e.currentTarget) && (e.target.targetedContacts.length !== 0)) {
                e.target.style.transform = new CSSMatrix();
                setView("0");
            }

            //  Press and hold is similar to End from a cleanup perspective, so clear the gesture input pointer type
            e.gestureObject.pointerType = null;
        }
    }

})();
