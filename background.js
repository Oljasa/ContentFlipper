let isSelectionMode = false;

chrome.action.onClicked.addListener(async (tab) => {
  isSelectionMode = !isSelectionMode;
  
  try {
    // First, inject the content script if it hasn't been injected
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    // Then send the message
    await chrome.tabs.sendMessage(tab.id, {
      action: 'toggleSelectionMode',
      isSelectionMode: isSelectionMode
    });
  } catch (error) {
    console.error('Error:', error);
  }
}); 