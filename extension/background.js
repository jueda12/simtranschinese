importScripts("shared/converter.js");

const MENU_IDS = {
  selectionToTraditional: "selection-to-traditional",
  selectionToSimplified: "selection-to-simplified",
  pageToTraditional: "page-to-traditional",
  pageToSimplified: "page-to-simplified",
  inputToTraditional: "input-to-traditional",
  inputToSimplified: "input-to-simplified"
};

function createMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_IDS.selectionToTraditional,
      title: "Convert selected text to Traditional Chinese",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: MENU_IDS.selectionToSimplified,
      title: "Convert selected text to Simplified Chinese",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: MENU_IDS.pageToTraditional,
      title: "Convert page to Traditional Chinese",
      contexts: ["page"]
    });

    chrome.contextMenus.create({
      id: MENU_IDS.pageToSimplified,
      title: "Convert page to Simplified Chinese",
      contexts: ["page"]
    });

    chrome.contextMenus.create({
      id: MENU_IDS.inputToTraditional,
      title: "Convert input field to Traditional Chinese",
      contexts: ["editable"]
    });

    chrome.contextMenus.create({
      id: MENU_IDS.inputToSimplified,
      title: "Convert input field to Simplified Chinese",
      contexts: ["editable"]
    });
  });
}

function sendToTab(tabId, action, direction) {
  if (!tabId) {
    return;
  }

  chrome.tabs.sendMessage(tabId, { action, direction }, () => {
    if (chrome.runtime.lastError) {
      console.debug("Message delivery failed:", chrome.runtime.lastError.message);
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  createMenus();
});

chrome.runtime.onStartup.addListener(() => {
  createMenus();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) {
    return;
  }

  switch (info.menuItemId) {
    case MENU_IDS.selectionToTraditional:
      sendToTab(tab.id, "convert-selection", "toTraditional");
      break;
    case MENU_IDS.selectionToSimplified:
      sendToTab(tab.id, "convert-selection", "toSimplified");
      break;
    case MENU_IDS.pageToTraditional:
      sendToTab(tab.id, "convert-page", "toTraditional");
      break;
    case MENU_IDS.pageToSimplified:
      sendToTab(tab.id, "convert-page", "toSimplified");
      break;
    case MENU_IDS.inputToTraditional:
      sendToTab(tab.id, "convert-input", "toTraditional");
      break;
    case MENU_IDS.inputToSimplified:
      sendToTab(tab.id, "convert-input", "toSimplified");
      break;
    default:
      break;
  }
});
