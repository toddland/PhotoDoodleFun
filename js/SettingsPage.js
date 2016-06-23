//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {

    document.addEventListener("DOMContentLoaded", function () {

        //watch for view changes
        window.addEventListener("resize", onresize);
        onresize();

        document.getElementById("button1").addEventListener("click", onColorBtn);

    }, false);
    WinJS.UI.processAll();
    function onColorBtn(eventArgs)
    {
        document.getElementById("app").style.backgroundColor = eventArgs;
    }

    function onresize() {
        //var availableImageWidth = contentHost.clientWidth;
        //var availableImageHeight = contentHost.clientHeight;

        //document.getElementById("videoBox").height = availableImageHeight;
        //document.getElementById("videoBox").width = availableImageWidth;
    }

})();