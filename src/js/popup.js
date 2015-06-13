// TODO URL Next Plus for Google Chrome © 2011 Roy Six

console.log("URLNP.Popup");

/**
 * URL Next Plus Popup.
 * 
 * Uses the JavaScript Revealing Module Pattern.
 */
var URLNP = URLNP || {};
URLNP.Popup = URLNP.Popup || function () {

  var instance, // tab's instance cache
      items_,   // storage items cache TODO
      DOM = {}; // Map to cache DOM elements: key=id, value=element

  /**
   * Loads the DOM content needed to display the popup page.
   * 
   * DOMContentLoaded will fire when the DOM is loaded. Unlike the conventional
   * "load", it does not wait for images and media.
   * 
   * @public
   */
  function DOMContentLoaded() {
    console.log("DOMContentLoaded()");
    // Cache DOM elements
    var ids = document.querySelectorAll("[id]"),
        i;
    for (i = 0; i < ids.length; i++) {
      DOM["#" + ids[i].id] = ids[i];
    }
    // Set localization text (i18n) from messages.json
    DOM["#next-input"].title = chrome.i18n.getMessage("popup_next_input");
    DOM["#prev-input"].title = chrome.i18n.getMessage("popup_prev_input");
    DOM["#clear-input"].title = chrome.i18n.getMessage("popup_clear_input");
    DOM["#setup-input"].title = chrome.i18n.getMessage("popup_setup_input");
    DOM["#url-label"].innerText = chrome.i18n.getMessage("popup_url_label");
    DOM["#selection-label"].innerText = chrome.i18n.getMessage("popup_selection_label");
    DOM["#interval-label"].innerText = chrome.i18n.getMessage("popup_interval_label");
    DOM["#setup-accept-input"].value = chrome.i18n.getMessage("popup_accept_input");
    DOM["#setup-cancel-input"].value = chrome.i18n.getMessage("popup_cancel_input");
    // Add Event Listeners to the DOM elements
    DOM["#next-input"].addEventListener("click", clickNext, false);
    DOM["#prev-input"].addEventListener("click", clickPrev, false);
    DOM["#clear-input"].addEventListener("click", clickClear, false);
    DOM["#setup-input"].addEventListener("click", toggleView, false);
    DOM["#setup-cancel-input"].addEventListener("click", toggleView, false);
    DOM["#setup-accept-input"].addEventListener("click", setup, false);
    DOM["#url-textarea"].addEventListener("mouseup", selectURL, false);
    DOM["#url-textarea"].addEventListener("keyup", selectURL, false);
    // Get this active tab's instance and update controls
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        chrome.storage.sync.get(null, function(items) {
          items_ = items;
          instance = backgroundPage.URLNP.Background.getInstance(tabs[0], items);
          DOM["#setup"].mode.value = instance.mode;
          DOM["#url-textarea"].value =instance.tab.url; // or tab.url
          DOM["#selection-input"].value = instance.selection;
          DOM["#selection-start-input"].value = instance.selectionStart;
          DOM["#interval-input"].value = instance.interval;
          DOM["#setup-input"].className = items_.animationsEnabled ? "hvr-wobble-bottom" : "";
          updateControls();
        });
      });
    });
  }

  /**
   * Updates this tab to the next URL if the instance is enabled.
   * 
   * @private
   */
  function clickNext() {
    console.log("clickNext()");
    if (instance.enabled) {
      if (items_.animationsEnabled) {
        URLNP.UI.clickHoverCss(this, "hvr-wobble-horizontal-click");
      }
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.URLNP.Background.updateTab(instance, "next");
        instance = backgroundPage.URLNP.Background.getInstance(instance.tab);
      });
    }
  }

  /**
   * Updates this tab to the previous URL if the instance is enabled.
   * 
   * @private
   */
  function clickPrev() {
    console.log("clickPrev()");
    if (instance.enabled) {
      if (items_.animationsEnabled) {
        URLNP.UI.clickHoverCss(this, "hvr-wobble-horizontal-click");
      }
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.URLNP.Background.updateTab(instance, "prev");
        instance = backgroundPage.URLNP.Background.getInstance(instance.tab);
      });
    }
  }

  /**
   * Clears and disables this tab's instance if it is enabled.
   * 
   * @private
   */
  function clickClear() {
    console.log("clickClear()");
    if (instance.enabled) {
      if (items_.animationsEnabled) {
        URLNP.UI.clickHoverCss(this, "hvr-buzz-out-click");
      }
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        backgroundPage.URLNP.Background.setInstance(instance.tab, undefined);
        instance.enabled = false;
        updateControls();
      });
    }
  }

  /**
   * Toggles the popup between the controls and the setup views.
   * 
   * @private
   */
  function toggleView() {
    console.log("toggleView()");
    switch (this.id) {
      case "setup-input": // Case 1: Hide controls, show setup
        DOM["#controls"].className = "fade-out";
        setTimeout(function () {
          DOM["#controls"].classList.add("display-none");
          DOM["#setup"].className = "display-block fade-in";
          DOM["#url-textarea"].focus();
          DOM["#url-textarea"].setSelectionRange(instance.selectionStart, instance.selectionStart + instance.selection.length);
          //selectURL();
        }, 300);
        break;
      case "setup-accept-input": // Case2: Hide setup, show controls
      case "setup-cancel-input":
        DOM["#setup"].className = "fade-out";
        setTimeout(function () {
          DOM["#setup"].classList.add("display-none");
          DOM["#controls"].className = "display-block fade-in";
          updateControls(); // Needed to reset hover.css click effect
        }, 300);
        break;
      default:
        break;
    }
  }

  /**
   * Updates the control images based on whether the instance is enabled.
   * 
   * @private
   */
  function updateControls() {
    console.log("updateControls()");
    var className = instance.enabled ? items_.animationsEnabled ? "hvr-grow" : "" : "disabled";
    DOM["#next-input"].className = className;
    DOM["#prev-input"].className = className;
    DOM["#clear-input"].className = className;
  }

  /**
   * Sets up the instance. First validates user input for any errors, then saves
   * and enables the instance, and then toggles the view back to the controls.
   * 
   * @private
   */
  function setup() {
    console.log("setup()");
    //document.querySelector('input[name=genderS]:checked').value
    var mode = DOM["#setup"].mode.value,
        selection = DOM["#selection-input"].value,
        selectionStart = DOM["#selection-start-input"].value,
        interval = DOM["#interval-input"].value,
        errors = [
          selection === "" ? chrome.i18n.getMessage("popup_selection_blank_error") : "",
          !/^[a-z0-9]+$/i.exec(selection) ? chrome.i18n.getMessage("popup_selection_notalphanumeric_error") : "",
          instance.tab.url.indexOf(selection) === -1 ? chrome.i18n.getMessage("popup_selection_notinurl_error") : "",
          selectionStart < 0 ? chrome.i18n.getMessage("popup_selectionstart_invalid_error") : "",
          interval === "" ? chrome.i18n.getMessage("popup_interval_blank_error") : "",
          interval === "0" ? chrome.i18n.getMessage("popup_interval_0_error") : "",
          +interval < 0 ? chrome.i18n.getMessage("popup_interval_negative_error") : ""
        ];
        console.log("mode is " + mode);
    // We can tell there was an error if any of the array slots weren't empty
    if (mode === "modify-url" && (errors[0] !== "" || errors[1] !== "" || errors[2] !== "" || errors[3] !== "")) {
      console.log("\terrors:" + errors);
      URLNP.UI.generateAlert(errors);
    } else {
      chrome.runtime.getBackgroundPage(function(backgroundPage) {
        chrome.storage.sync.get(null, function(items) {
          instance.enabled = true;
          instance.mode = mode;
          instance.interval = +interval;
          instance.selection = selection;
          instance.selectionStart = +selectionStart;
          backgroundPage.URLNP.Background.setInstance(instance.tab, instance);
          toggleView.call(DOM["#setup-accept-input"]);
          updateControls();
          if (items.keyEnabled) {
            console.log("\t\tadding keyListener");
            chrome.tabs.sendMessage(instance.tab.id, {greeting: "addKeyListener"}, function(response) {});
          }
        });
      });
    }
  }

  /**
   * Handle URL selection on mouseup and keyup events. Saves the selectionStart
   * to a hidden input and updates the selection input to the selected text.
   * 
   * @private
   */
  function selectURL() {
    console.log("selectURL()");
    DOM["#selection-start-input"].value = DOM["#url-textarea"].selectionStart;
    DOM["#selection-input"].value = window.getSelection().toString();
    console.log("\tselection-input.value=" + DOM["#selection-input"].value);
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Popup.DOMContentLoaded, false);