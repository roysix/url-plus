/**
 * URL Incrementer Options
 * 
 * @author Roy Six
 * @namespace
 */

var URLI = URLI || {};

URLI.Options = URLI.Options || function () {

  var DOM = {}, // Map to cache DOM elements: key=id, value=element
      FLAG_KEY_NONE = 0x0, // 0000
      FLAG_KEY_ALT = 0x1, // 0001
      FLAG_KEY_CTRL = 0x2, // 0010
      FLAG_KEY_SHIFT = 0x4, // 0100
      FLAG_KEY_META = 0x8, // 1000
      KEY_MODIFIER_STRING_MAP = { // Map for key codes that shouldn't be written since they are event modifiers
        "Shift": "Shift", "Control": "Ctrl", "Alt": "Alt", "Meta": "Meta",
        "ShiftLeft":   "Shift", "ShiftRight":   "Shift",
        "ControlLeft": "Ctrl",  "ControlRight": "Ctrl",
        "AltLeft":     "Alt",   "AltRight":     "Alt",
        "MetaLeft":    "Meta",  "MetaRight":    "Meta"
      },
      key = [0,""], // Stores the key event modifiers [0] and key code [1]
      NEXT_PREVS = ["Next", "Prev", "Forward", "Back", "New", "Old", ">", "<"],
      FACES = ["≧☉_☉≦", "(⌐■_■)♪", "(ᵔᴥᵔ)", "◉_◉", "(─__─)", "(+__X)"];
    //FACES = ["(｡◕‿◕｡)", "≧☉_☉≦", "(▰˘◡˘▰)", "♥‿♥", "(✿´‿`)", "(─‿‿─)", "(｡◕‿‿◕｡)", "(⌐■_■)♪", "(ᵔᴥᵔ)", "◉_◉"];

  /**
   * Loads the DOM content needed to display the options page.
   * 
   * DOMContentLoaded will fire when the DOM is loaded. Unlike the conventional
   * "load", it does not wait for images and media.
   * 
   * @public
   */
  function DOMContentLoaded() {
    var ids = document.querySelectorAll("[id]"),
        i18ns = document.querySelectorAll("[data-i18n]"),
        el,
        i;
    // Cache DOM elements
    for (i = 0; i < ids.length; i++) {
      el = ids[i];
      DOM["#" + el.id] = el;
    }
    // Set i18n (internationalization) text from messages.json
    for (i = 0; i < i18ns.length; i++) {
      el = i18ns[i];
      el[el.dataset.i18n] = chrome.i18n.getMessage(el.id.replace(/-/g, '_').replace(/\*.*/, ''));
    }
    // Add Event Listeners to the DOM elements
    DOM["#internal-shortcuts-enable-button"].addEventListener("click", function() { URLI.Permissions.requestPermissions("internalShortcuts", function(granted) { if (granted) { populateValuesFromStorage("internalShortcuts"); } }) });
    DOM["#chrome-shortcuts-enable-button"].addEventListener("click", function() { URLI.Permissions.removePermissions("internalShortcuts", function(removed) { if (removed) { populateValuesFromStorage("internalShortcuts"); } }) });
    DOM["#chrome-shortcuts-quick-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"quickEnabled": this.checked}); });
    DOM["#chrome-shortcuts-button"].addEventListener("click", function() { chrome.tabs.update({url: "chrome://extensions/shortcuts"}); });
    DOM["#key-quick-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"keyQuickEnabled": this.checked}); });
    DOM["#mouse-quick-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"mouseQuickEnabled": this.checked}); });
    DOM["#key-increment-input"].addEventListener("keydown", function (event) { setKey(event); writeInput(this, key); });
    DOM["#key-decrement-input"].addEventListener("keydown", function (event) { setKey(event); writeInput(this, key); });
    DOM["#key-next-input"].addEventListener("keydown", function (event) { setKey(event); writeInput(this, key); });
    DOM["#key-prev-input"].addEventListener("keydown", function (event) { setKey(event); writeInput(this, key); });
    DOM["#key-clear-input"].addEventListener("keydown", function (event) { setKey(event); writeInput(this, key); });
    DOM["#key-auto-input"].addEventListener("keydown", function (event) { setKey(event); writeInput(this, key); });
    DOM["#key-download-input"].addEventListener("keydown", function (event) { setKey(event); writeInput(this, key); });
    DOM["#key-increment-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyIncrement": key}, function() { setKeyEnabled(); }); });
    DOM["#key-decrement-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyDecrement": key}, function() { setKeyEnabled(); }); });
    DOM["#key-next-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyNext": key}, function() { setKeyEnabled(); }); });
    DOM["#key-prev-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyPrev": key}, function() { setKeyEnabled(); }); });
    DOM["#key-clear-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyClear": key}, function() { setKeyEnabled(); }); });
    DOM["#key-auto-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyAuto": key}, function() { setKeyEnabled(); }); });
    DOM["#key-download-input"].addEventListener("keyup", function () { chrome.storage.sync.set({"keyDownload": key}, function() { setKeyEnabled(); }); });
    DOM["#key-increment-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyIncrement": []}, function() { setKeyEnabled(); }); writeInput(DOM["#key-increment-input"], []); });
    DOM["#key-decrement-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyDecrement": []}, function() { setKeyEnabled(); }); writeInput(DOM["#key-decrement-input"], []); });
    DOM["#key-next-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyNext": []}, function() { setKeyEnabled(); }); writeInput(DOM["#key-next-input"], []); });
    DOM["#key-prev-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyPrev": []}, function() { setKeyEnabled(); }); writeInput(DOM["#key-prev-input"], []); });
    DOM["#key-clear-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyClear": []}, function() { setKeyEnabled(); }); writeInput(DOM["#key-clear-input"], []); });
    DOM["#key-auto-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyAuto": []}, function() { setKeyEnabled(); }); writeInput(DOM["#key-auto-input"], []); });
    DOM["#key-download-clear-input"].addEventListener("click", function () { chrome.storage.sync.set({"keyDownload": []}, function() { setKeyEnabled(); }); writeInput(DOM["#key-download-input"], []); });
    DOM["#mouse-increment-select"].addEventListener("change", function() { chrome.storage.sync.set({"mouseIncrement": +this.value}, function() { setMouseEnabled(); }); });
    DOM["#mouse-decrement-select"].addEventListener("change", function() { chrome.storage.sync.set({"mouseDecrement": +this.value}, function() { setMouseEnabled(); }); });
    DOM["#mouse-next-select"].addEventListener("change", function() { chrome.storage.sync.set({"mouseNext": +this.value}, function() { setMouseEnabled(); }); });
    DOM["#mouse-prev-select"].addEventListener("change", function() { chrome.storage.sync.set({"mousePrev": +this.value}, function() { setMouseEnabled(); }); });
    DOM["#mouse-clear-select"].addEventListener("change", function() { chrome.storage.sync.set({"mouseClear": +this.value}, function() { setMouseEnabled(); }); });
    DOM["#mouse-auto-select"].addEventListener("change", function() { chrome.storage.sync.set({"mouseAuto": +this.value}, function() { setMouseEnabled(); }); });
    DOM["#mouse-download-select"].addEventListener("change", function() { chrome.storage.sync.set({"mouseDownload": +this.value}, function() { setMouseEnabled(); }); });
    DOM["#icon-color-radio-dark"].addEventListener("change", changeIconColor);
    DOM["#icon-color-radio-light"].addEventListener("change", changeIconColor);
    DOM["#icon-color-radio-rainbow"].addEventListener("change", changeIconColor);
    DOM["#icon-color-radio-urli"].addEventListener("change", changeIconColor);
    DOM["#icon-feedback-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"iconFeedbackEnabled": this.checked}); });
    DOM["#popup-button-size-input"].addEventListener("change", function () { if (+this.value >= 16 && +this.value <= 32) { chrome.storage.sync.set({"popupButtonSize": +this.value});
      DOM["#popup-button-size-img"].style = "width:" + (+this.value) + "px; height:" + (+this.value) + "px;"; } });
    DOM["#popup-button-size-img"].addEventListener("click", function () { if (DOM["#popup-animations-enable-input"].checked) { URLI.UI.clickHoverCss(this, "hvr-push-click"); } });
    DOM["#popup-animations-enable-input"].addEventListener("change", function () { chrome.storage.sync.set({"popupAnimationsEnabled": this.checked});
      DOM["#popup-button-size-img"].className = this.checked ? "hvr-grow" : "" });
    DOM["#popup-settings-can-overwrite-input"].addEventListener("change", function () { chrome.storage.sync.set({"popupSettingsCanOverwrite": this.checked}); });
    DOM["#popup-open-setup-input"].addEventListener("change", function () { chrome.storage.sync.set({"popupOpenSetup": this.checked}); });
    DOM["#selection-select"].addEventListener("change", function() { DOM["#selection-custom"].className = this.value === "custom" ? "display-block fade-in" : "display-none"; chrome.storage.sync.set({"selectionPriority": this.value}); });
    DOM["#selection-custom-save-button"].addEventListener("click", function () { customSelection("save"); });
    DOM["#selection-custom-test-button"].addEventListener("click", function() { customSelection("test"); });
    DOM["#interval-input"].addEventListener("change", function () { chrome.storage.sync.set({"interval": +this.value > 0 ? +this.value : 1}); });
    DOM["#leading-zeros-pad-by-detection-input"].addEventListener("change", function() { chrome.storage.sync.set({ "leadingZerosPadByDetection": this.checked}); });
    DOM["#base-select"].addEventListener("change", function() { DOM["#base-case"].className = +this.value > 10 ? "display-block fade-in" : "display-none"; chrome.storage.sync.set({"base": +this.value}); });
    DOM["#base-case-lowercase-input"].addEventListener("change", function () { chrome.storage.sync.set({"baseCase": this.value}); });
    DOM["#base-case-uppercase-input"].addEventListener("change", function () { chrome.storage.sync.set({"baseCase": this.value}); });
    DOM["#next-prev-enhanced-enable-button"].addEventListener("click", function() { URLI.Permissions.requestPermissions("nextPrevEnhanced", function(granted) { if (granted) { populateValuesFromStorage("nextPrevEnhanced"); } }) });
    DOM["#next-prev-enhanced-disable-button"].addEventListener("click", function() { URLI.Permissions.removePermissions("nextPrevEnhanced", function(removed) { if (removed) { populateValuesFromStorage("nextPrevEnhanced"); } }) });
    DOM["#next-prev-links-priority-select"].addEventListener("change", function () { chrome.storage.sync.set({"nextPrevLinksPriority": this.value}); });
    DOM["#next-prev-same-domain-policy-enable-input"].addEventListener("change", function() { chrome.storage.sync.set({"nextPrevSameDomainPolicy": this.checked}); });
    DOM["#next-prev-popup-buttons-input"].addEventListener("change", function() { chrome.storage.sync.set({"nextPrevPopupButtons": this.checked}); });
    DOM["#auto-action-select"].addEventListener("change", function () { chrome.storage.sync.set({"autoAction": this.value}); });
    DOM["#auto-times-input"].addEventListener("change", function () { chrome.storage.sync.set({"autoTimes": +this.value >= 1 && +this.value <= 1000 ? +this.value : 10}); });
    DOM["#auto-seconds-input"].addEventListener("change", function () { chrome.storage.sync.set({"autoSeconds": +this.value >= 1 && +this.value <= 3600 ? +this.value : 5}); });
    DOM["#auto-wait-input"].addEventListener("change", function() { chrome.storage.sync.set({ "autoWait": this.checked}); });
    DOM["#auto-badge-input"].addEventListener("change", function() { chrome.storage.sync.set({ "autoBadge": this.checked ? "times": ""}); });
    DOM["#download-enable-button"].addEventListener("click", function() { URLI.Permissions.requestPermissions("download", function(granted) { if (granted) { populateValuesFromStorage("download"); } }) });
    DOM["#download-disable-button"].addEventListener("click", function() { URLI.Permissions.removePermissions("download", function(removed) { if (removed) { populateValuesFromStorage("download"); } }) });
    DOM["#download-strategy-select"].addEventListener("change", function () { chrome.storage.sync.set({"downloadStrategy": this.value}); });
    DOM["#download-selector-input"].addEventListener("input", function () { chrome.storage.sync.set({"downloadSelector": this.value}); });
    DOM["#download-includes-input"].addEventListener("input", function () { chrome.storage.sync.set({"downloadIncludes": this.value }); });
    DOM["#download-limit-input"].addEventListener("change", function () { chrome.storage.sync.set({"downloadLimit": +this.value >= 1 && +this.value <= 1000 ? +this.value : 10}); });
    DOM["#urli-click-count"].addEventListener("click", clickURLI);
    DOM["#reset-options-button"].addEventListener("click", resetOptions);
    DOM["#manifest-name"].textContent = chrome.runtime.getManifest().name;
    DOM["#manifest-version"].textContent = chrome.runtime.getManifest().version;
    DOM["#extension-id"].textContent = chrome.runtime.id;
    // Populate all values from storage
    populateValuesFromStorage("all");
  }

  /**
   * Populates the options form values from the extension storage.
   *
   * @param values which values to populate, e.g. "all" for all or "xyz" for only xyz values (with fade-in effect)
   * @private
   */
  function populateValuesFromStorage(values) {
    chrome.storage.sync.get(null, function(items) {
      if (values === "all" || values === "internalShortcuts") {
        DOM["#chrome-shortcuts"].className = !items.permissionsInternalShortcuts ? values === "internalShortcuts" ? "display-block fade-in" : "display-block" : "display-none";
        DOM["#internal-shortcuts"].className = items.permissionsInternalShortcuts ? values === "internalShortcuts" ? "display-block fade-in" : "display-block" : "display-none";
      }
      if (values === "all" || values === "nextPrevEnhanced") {
        DOM["#next-prev-enhanced-disable-button"].className = items.permissionsNextPrevEnhanced ? values === "nextPrevEnhanced" ? "display-block fade-in" : "display-block" : "display-none";
        DOM["#next-prev-enhanced-enable-button"].className = !items.permissionsNextPrevEnhanced ? values === "nextPrevEnhanced" ? "display-block fade-in" : "display-block" : "display-none";
        DOM["#next-prev-enhanced-enable"].className = items.permissionsNextPrevEnhanced ? values === "nextPrevEnhanced" ? "display-block fade-in" : "display-block" : "display-none";
        DOM["#next-prev-enhanced-disable"].className = !items.permissionsNextPrevEnhanced ? values === "nextPrevEnhanced" ? "display-block fade-in" : "display-block" : "display-none";
      }
      if (values === "all" || values === "download") {
        DOM["#download-disable-button"].className = items.permissionsDownload ? values === "download" ? "display-block fade-in" : "display-block" : "display-none";
        DOM["#download-enable-button"].className = !items.permissionsDownload ? values === "download" ? "display-block fade-in" : "display-block" : "display-none";
        DOM["#download-settings-enabled"].className = items.permissionsDownload ? values === "download" ? "display-block fade-in" : "display-block" : "display-none";
        DOM["#download-settings-disabled"].className = !items.permissionsDownload ? values === "download" ? "display-block fade-in" : "display-block" : "display-none";
      }
      if (values === "all") {
        DOM["#chrome-shortcuts-quick-enable-input"].checked = items.quickEnabled;
        DOM["#key-quick-enable-input"].checked = items.keyQuickEnabled;
        DOM["#mouse-quick-enable-input"].checked = items.mouseQuickEnabled;
        DOM["#key-enable-img"].className = items.keyEnabled ? "display-inline" : "display-none";
        DOM["#mouse-enable-img"].className = items.mouseEnabled ? "display-inline" : "display-none";
        writeInput(DOM["#key-increment-input"], items.keyIncrement);
        writeInput(DOM["#key-decrement-input"], items.keyDecrement);
        writeInput(DOM["#key-next-input"], items.keyNext);
        writeInput(DOM["#key-prev-input"], items.keyPrev);
        writeInput(DOM["#key-clear-input"], items.keyClear);
        writeInput(DOM["#key-auto-input"], items.keyAuto);
        writeInput(DOM["#key-download-input"], items.keyDownload);
        DOM["#mouse-increment-select"].value = items.mouseIncrement;
        DOM["#mouse-decrement-select"].value = items.mouseDecrement;
        DOM["#mouse-next-select"].value = items.mouseNext;
        DOM["#mouse-prev-select"].value = items.mousePrev;
        DOM["#mouse-clear-select"].value = items.mouseClear;
        DOM["#mouse-auto-select"].value = items.mouseAuto;
        DOM["#mouse-download-select"].value = items.mouseDownload;
        DOM["#icon-color-radio-" + items.iconColor].checked = true;
        DOM["#icon-feedback-enable-input"].checked = items.iconFeedbackEnabled;
        DOM["#popup-button-size-input"].value = items.popupButtonSize;
        DOM["#popup-button-size-img"].style = "width:" + items.popupButtonSize + "px; height:" + items.popupButtonSize + "px;";
        DOM["#popup-button-size-img"].className = items.popupAnimationsEnabled ? "hvr-grow" : "";
        DOM["#popup-animations-enable-input"].checked = items.popupAnimationsEnabled;
        DOM["#popup-open-setup-input"].checked = items.popupOpenSetup;
        DOM["#popup-settings-can-overwrite-input"].checked = items.popupSettingsCanOverwrite;
        DOM["#auto-action-select"].value = items.autoAction;
        DOM["#auto-times-input"].value = items.autoTimes;
        DOM["#auto-seconds-input"].value = items.autoSeconds;
        DOM["#auto-wait-input"].checked = items.autoWait;
        DOM["#auto-badge-input"].checked = items.autoBadge === "times";
        DOM["#download-strategy-select"].value = items.downloadStrategy;
        //DOM["#download-types-jpg"].checked = items.downloadTypes.jpg;
        DOM["#download-selector-input"].value = items.downloadSelector;
        DOM["#download-includes-input"].value = items.downloadIncludes;
        DOM["#download-limit-input"].value = items.downloadLimit;
        DOM["#selection-select"].value = items.selectionPriority;
        DOM["#selection-custom"].className = items.selectionPriority === "custom" ? "display-block" : "display-none";
        DOM["#selection-custom-url-textarea"].value = items.selectionCustom.url;
        DOM["#selection-custom-pattern-input"].value = items.selectionCustom.pattern;
        DOM["#selection-custom-flags-input"].value = items.selectionCustom.flags;
        DOM["#selection-custom-group-input"].value = items.selectionCustom.group;
        DOM["#selection-custom-index-input"].value = items.selectionCustom.index;
        DOM["#interval-input"].value = items.interval;
        DOM["#leading-zeros-pad-by-detection-input"].checked = items.leadingZerosPadByDetection;
        DOM["#base-select"].value = items.base;
        DOM["#base-case"].className = items.base > 10 ? "display-block" : "display-none";
        DOM["#base-case-lowercase-input"].checked = items.baseCase === "lowercase";
        DOM["#base-case-uppercase-input"].checked = items.baseCase === "uppercase";
        DOM["#next-prev-links-priority-select"].value = items.nextPrevLinksPriority;
        DOM["#next-prev-same-domain-policy-enable-input"].checked = items.nextPrevSameDomainPolicy;
        DOM["#next-prev-popup-buttons-input"].checked = items.nextPrevPopupButtons;
        DOM["#urli-click-count"].value = items.urliClickCount;
      }
    });
  }

  /**
   * Changes the extension icon color in the browser's toolbar (browserAction).
   *
   * @private
   */
  function changeIconColor() {
    chrome.browserAction.setIcon({
      path : {
        "16": "/img/icons/" + this.value + "/16.png",
        "24": "/img/icons/" + this.value + "/24.png",
        "32": "/img/icons/" + this.value + "/32.png"
      }
    });
    chrome.storage.sync.set({"iconColor": this.value});
  }

  /**
   * Sets the enabled state of key shortcuts.
   * 
   * @private
   */
  function setKeyEnabled() {
    chrome.storage.sync.get(null, function(items) {
      var enabled = items.keyIncrement.length !== 0 || items.keyDecrement.length !== 0 || items.keyNext.length !== 0 || items.keyPrev.length !== 0 || items.keyClear.length !== 0;
      chrome.storage.sync.set({"keyEnabled": enabled}, function() {
        DOM["#key-enable-img"].className = enabled ? "display-inline" : "display-none";
      });
    });
  }

  /**
   * Sets the enabled state of mouse button shortcuts.
   * 
   * @private
   */
  function setMouseEnabled() {
    chrome.storage.sync.get(null, function(items) {
      var enabled = items.mouseIncrement !== -1 || items.mouseDecrement !== -1 || items.mouseNext !== -1 || items.mousePrev !== -1 || items.mouseClear !== -1;
      chrome.storage.sync.set({"mouseEnabled": enabled}, function() {
        DOM["#mouse-enable-img"].className = enabled ? "display-inline" : "display-none";
      });
    });
  }

  /**
   * Sets the key that was pressed on a keydown event. This is needed afterwards
   * to write the key to the input value and save the key to storage on keyup.
   * 
   * @param event the key event fired
   * @private
   */
  function setKey(event) {
    // Set key [0] as the event modifiers OR'd together and [1] as the key code
    key = [
      (event.altKey   ? FLAG_KEY_ALT   : FLAG_KEY_NONE) | // 0001
      (event.ctrlKey  ? FLAG_KEY_CTRL  : FLAG_KEY_NONE) | // 0010
      (event.shiftKey ? FLAG_KEY_SHIFT : FLAG_KEY_NONE) | // 0100
      (event.metaKey  ? FLAG_KEY_META  : FLAG_KEY_NONE),  // 1000
      event.code
    ];
  }

  /**
   * Writes the key(s) that were pressed to the text input.
   * 
   * @param input the input to write to
   * @param key the key object to write
   * @private
   */
  function writeInput(input, key) {
    // Write the input value based on the key event modifier bits and key code
    // using KEY_CODE_STRING_MAP for special cases or String.fromCharCode()
    // Note: If the key code is in the KEY_MODIFIER_STRING_MAP (e.g. Alt, Ctrl), it is not written a second time
    var text = "",
        keyPressed = false;
    if (!key || key.length === 0) { text = chrome.i18n.getMessage("key_notset_option"); }
    else {
      if ((key[0] & FLAG_KEY_ALT))        {                                    text += "Alt";   keyPressed = true; }
      if ((key[0] & FLAG_KEY_CTRL)  >> 1) { if (keyPressed) { text += " + "; } text += "Ctrl";  keyPressed = true; }
      if ((key[0] & FLAG_KEY_SHIFT) >> 2) { if (keyPressed) { text += " + "; } text += "Shift"; keyPressed = true; }
      if ((key[0] & FLAG_KEY_META)  >> 3) { if (keyPressed) { text += " + "; } text += "Meta";  keyPressed = true; }
      if (key[1] && !KEY_MODIFIER_STRING_MAP[key[1]]) { if (keyPressed) { text += " + "; } text += key[1]; }
    }
    input.value = text;
  }

  /**
   * Validates the custom selection regular expression fields and then performs
   * the desired action.
   * 
   * @param action the action to perform (test or save)
   * @private
   */
  function customSelection(action) {
    var url = DOM["#selection-custom-url-textarea"].value,
        pattern = DOM["#selection-custom-pattern-input"].value,
        flags = DOM["#selection-custom-flags-input"].value,
        group = +DOM["#selection-custom-group-input"].value,
        index = +DOM["#selection-custom-index-input"].value,
        regexp,
        matches,
        selection,
        selectionStart;
    try {
      regexp = new RegExp(pattern, flags);
      matches = regexp.exec(url);
      if (!pattern || !matches) {
        throw chrome.i18n.getMessage("selection_custom_match_error");
      }
      if (group < 0) {
        throw chrome.i18n.getMessage("selection_custom_group_error");
      }
      if (index < 0) {
        throw chrome.i18n.getMessage("selection_custom_index_error");
      }
      if (!matches[group]) {
        throw chrome.i18n.getMessage("selection_custom_matchgroup_error");
      }
      selection = matches[group].substring(index);
      if (!selection || selection === "") {
        throw chrome.i18n.getMessage("selection_custom_matchindex_error");
      }
      selectionStart = matches.index + index;
      if (selectionStart > url.length || selectionStart + selection.length > url.length) {
        throw chrome.i18n.getMessage("selection_custom_matchindex_error");
      }
      if (!/^[a-z0-9]+$/i.test(url.substring(selectionStart, selectionStart + selection.length))) {
        throw url.substring(selectionStart, selectionStart + selection.length) + " " + chrome.i18n.getMessage("selection_custom_matchnotalphanumeric_error");
      }
    } catch (e) {
      DOM["#selection-custom-message-span"].textContent = e;
      return;
    }
    if (action === "test") {
      DOM["#selection-custom-message-span"].textContent = chrome.i18n.getMessage("selection_custom_test_success");
      DOM["#selection-custom-url-textarea"].setSelectionRange(selectionStart, selectionStart + selection.length);
      DOM["#selection-custom-url-textarea"].focus();
    } else if (action === "save") {
      DOM["#selection-custom-message-span"].textContent = chrome.i18n.getMessage("selection_custom_save_success");
      chrome.storage.sync.set({"selectionCustom": { "url": url, "pattern": pattern, "flags": flags, "group": group, "index": index }});
    }
  }

  /**
   * Resets the options by clearing the storage and setting it with the default storage values, removing any extra
   * permissions, and finally re-populating the options input values from storage again.
   *
   * @private
   */
  function resetOptions() {
    chrome.runtime.getBackgroundPage(function(backgroundPage) {
      chrome.storage.sync.clear(function() {
        chrome.storage.sync.set(backgroundPage.URLI.Background.getSDV(), function() {
          URLI.Permissions.removeAllPermissions(function(removed) { console.log("removed them all!! mwahaha" + removed); });
          changeIconColor.call(DOM["#icon-color-radio-dark"]);
          populateValuesFromStorage("all");
          URLI.UI.generateAlert([chrome.i18n.getMessage("reset_options_message")]);
        });
      });
    });
  }

  /**
   * Clicks the URLI input image.
   *
   * @private
   */
  function clickURLI() {
    var face = " " + FACES[Math.floor(Math.random() * FACES.length)];;
    this.value = +this.value + 1;
    chrome.storage.sync.set({ "urliClickCount": +this.value});
    URLI.UI.generateAlert([+this.value < 10 ? +this.value + " ..." : chrome.i18n.getMessage("urli_click_tickles") + face]);
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLI.Options.DOMContentLoaded);