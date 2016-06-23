// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
	"use strict";

	var app = WinJS.Application;
	var activation = Windows.ApplicationModel.Activation;
	var nav = WinJS.Navigation;
	var activationKinds = Windows.ApplicationModel.Activation.ActivationKind;
	var splitView;
	var titleBarHelper = CoreViewHelpers.CoreTitleBarHelper.getForCurrentView();
	var item;
	
	var appInsights = new Microsoft.ApplicationInsights.AppInsights({ instrumentationKey: "<YOUR KEY>", endpointUrl: "http://dc.services.visualstudio.com/v2/track" });

    // We insert the title bar as the first element in the body.
	var customTitleBar;
	var customTitleBarPromise = WinJS.Promise.wrap();

	var scenarios = [
   { url: "/pages/MainPage/MainPage.html", title: "Show & Tell!" },
	];

	function activated(eventObject) {
	    var activationKind = eventObject.detail.kind;
	    var activatedEventArgs = eventObject.detail.detail;

	    var p = WinJS.UI.processAll().
            then(function () {

                window.appInsights = appInsights;
                appInsights.trackPageView();

                // The resize event is raised when the view enters or exits full screen mode.
                // This scenario subscribes to the event just so it can update the
                // "full screen" button.
                window.addEventListener("resize", onresize);
                onresize();
               
                CustomTitlebar.Utils.onExtendView();

                // Navigate to either the first scenario or to the last running scenario
                // before suspension or termination.
                var url = scenarios[0].url;
                var initialState = {};
                var navHistory = app.sessionState.navigationHistory;
                if (navHistory) {
                    nav.history = navHistory;
                    url = navHistory.current.location;
                    initialState = navHistory.current.state || initialState;
                }
                initialState.activationKind = activationKind;
                initialState.activatedEventArgs = activatedEventArgs;
                nav.history.current.initialPlaceholder = true;
                return nav.navigate(url, initialState);
            });

	    // Calling done on a promise chain allows unhandled exceptions to propagate.
	    p.done();

	    // Use setPromise to indicate to the system that the splash screen must not be torn down
	    // until after processAll and navigate complete asynchronously.
	    eventObject.setPromise(p);
	}

	function navigating(eventObject) {
	    var url = eventObject.detail.location;
	    var host = document.getElementById("contentHost");
	    // Call unload and dispose methods on current scenario, if any exist
	    if (host.winControl) {
	        host.winControl.unload && host.winControl.unload();
	        host.winControl.dispose && host.winControl.dispose();
	    }
	    WinJS.Utilities.disposeSubTree(host);
	    WinJS.Utilities.empty(host);
	    WinJS.log && WinJS.log("", "", "status");

	    var p = WinJS.UI.Pages.render(url, host, eventObject.detail.state).
            then(function () {
                var navHistory = nav.history;
                app.sessionState.navigationHistory = {
                    backStack: navHistory.backStack.slice(0),
                    forwardStack: navHistory.forwardStack.slice(0),
                    current: navHistory.current
                };
                app.sessionState.lastUrl = url;
            });
	    p.done();
	    eventObject.detail.setPromise(p);
	}

	function onresize() {
	    document.getElementById("contentWrapper").style.height = (window.innerHeight - 2) + "px";
	    document.getElementById("contentWrapper").style.width = (window.innerWidth - 2) + "px";
	}

    function GetFullExceptionDetail(ex)
    {
     var thisException = string.Format("{0}: {1} - {2}", ex.GetType().Name, ex.Message, ex.StackTrace);
  
	    if (ex.InnerException != null)
	    {
	        // Recursively get inner exception details
	        var innerExceptionDetails = GetFullExceptionDetail(ex.InnerException);
  
	        if (string.IsNullOrEmpty(innerExceptionDetails))
	        {
	            thisException = string.Format("{0}\n\nINNER: {1}", thisException, innerExceptionDetails);
	        }
	    }
  
	    var aggregateException = ex;
  
	    if (aggregateException != null && aggregateException.InnerExceptions != null)
	    {
	        var count = 1;
	        var aggr = aggregateInner in aggregateException.InnerExceptions;
	        if (aggr)
	        {
	            // Don't include the aggregate that's just a duplicate of the inner.
	            if (aggregateInner != ex.InnerException)
	            {
	                // Recursively get aggregate inner exceptions
	                var aggregateInnerExceptionDetails = GetFullExceptionDetail(aggregateInner);
	                if (!string.IsNullOrEmpty(aggregateInnerExceptionDetails))
	                {
	                    thisException = string.Format("{0}\n\nAGGREGATE({1}): {2}", thisException, count, aggregateInnerExceptionDetails);
	                }
	            }
             
	            count++;
	        }
	    }
  
	  return thisException;
    }

	nav.addEventListener("navigating", navigating);
	app.addEventListener("activated", activated, false);
	app.start();
})();

window.onerror = function (E) {
   // appInsights.trackException(E);
    debugger;
}

