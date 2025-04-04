// Ensure we don't initialize multiple times
if (window.contentFlipperInitialized) {
  throw new Error('Content Flipper already initialized');
}
window.contentFlipperInitialized = true;

let isSelectionMode = false;
let highlightedElement = null;

// Create and style the highlight overlay
const highlightOverlay = document.createElement('div');
highlightOverlay.style.position = 'fixed';
highlightOverlay.style.pointerEvents = 'none';
highlightOverlay.style.border = '2px solid #4285f4';
highlightOverlay.style.backgroundColor = 'rgba(66, 133, 244, 0.1)';
highlightOverlay.style.zIndex = '10000';
highlightOverlay.style.display = 'none';
document.body.appendChild(highlightOverlay);

// Function to update highlight overlay position and size
function updateHighlight(element) {
  if (!element) {
    highlightOverlay.style.display = 'none';
    return;
  }

  const rect = element.getBoundingClientRect();
  highlightOverlay.style.display = 'block';
  highlightOverlay.style.left = `${rect.left}px`;
  highlightOverlay.style.top = `${rect.top}px`;
  highlightOverlay.style.width = `${rect.width}px`;
  highlightOverlay.style.height = `${rect.height}px`;
}

// Function to flip an element
function flipElement(element) {
  const currentTransform = window.getComputedStyle(element).transform;
  const flipTransform = 'scaleX(-1)';
  
  if (currentTransform === 'none') {
    element.style.transform = flipTransform;
  } else {
    element.style.transform = `${currentTransform} ${flipTransform}`;
  }
}

// Mouse move handler
function handleMouseMove(e) {
  if (!isSelectionMode) return;

  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (element && element !== highlightedElement) {
    highlightedElement = element;
    updateHighlight(element);
  }
}

// Click handler
function handleClick(e) {
  if (!isSelectionMode) return;

  e.preventDefault();
  e.stopPropagation();
  
  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (element) {
    flipElement(element);
    // Disable selection mode after flipping
    isSelectionMode = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('click', handleClick, true);
    updateHighlight(null);
    highlightedElement = null;
    console.log('Selection mode disabled after flip');
    
    // Notify background script that selection mode was disabled
    chrome.runtime.sendMessage({
      action: 'selectionModeDisabled'
    });
  }
}

// Message listener from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleSelectionMode') {
    isSelectionMode = message.isSelectionMode;
    
    if (isSelectionMode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleClick, true);
      console.log('Selection mode enabled');
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
      updateHighlight(null);
      highlightedElement = null;
      console.log('Selection mode disabled');
    }
  }
  // Always send a response to acknowledge receipt
  sendResponse({ received: true });
  return true; // Keep the message channel open for the async response
}); 