// Chat Timestamp Injector - Content Script
// Automatically prepends timestamp to ChatGPT messages before submission

(function() {
  'use strict';

  // Format timestamp in the specified format
  function formatTimestamp() {
    const now = new Date();
    const options = {
      timeZone: 'America/Toronto',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);
    
    // Extract parts
    const day = parts.find(p => p.type === 'weekday').value;
    const dayNum = parts.find(p => p.type === 'day').value;
    const month = parts.find(p => p.type === 'month').value;
    const year = parts.find(p => p.type === 'year').value;
    const hour = parts.find(p => p.type === 'hour').value;
    const minute = parts.find(p => p.type === 'minute').value;
    const dayPeriod = parts.find(p => p.type === 'dayPeriod').value;
    
    // Format day period (a.m./p.m.)
    const period = dayPeriod === 'AM' ? 'a.m.' : 'p.m.';
    
    return `[${day} ${dayNum} ${month} ${year}, ${hour}:${minute} ${period} EST, London, Ontario]`;
  }

  // Find the ChatGPT textarea input
  function findChatInput() {
    // ChatGPT uses various selectors for the textarea
    // Try common selectors used by ChatGPT
    const selectors = [
      'textarea[data-id="root"]',
      'textarea[id="prompt-textarea"]',
      'textarea[placeholder*="Message"]',
      'textarea[placeholder*="message"]',
      'textarea.rounded-lg',
      'textarea[aria-label*="Message"]'
    ];

    for (const selector of selectors) {
      const textarea = document.querySelector(selector);
      if (textarea) {
        return textarea;
      }
    }

    // Fallback: find any textarea in the main content area
    return document.querySelector('textarea');
  }

  // Track which textareas have listeners attached
  const processedTextareas = new WeakSet();

  // Setup event listener for the textarea
  function setupTextareaListener(textarea) {
    // Skip if already processed
    if (processedTextareas.has(textarea)) {
      return;
    }
    
    processedTextareas.add(textarea);
    
    // Add Enter key listener (without Shift)
    textarea.addEventListener('keydown', function(event) {
      // Check if Enter is pressed without Shift
      if (event.key === 'Enter' && !event.shiftKey) {
        const currentValue = textarea.value.trim();
        
        // Only prepend timestamp if message is not empty
        if (currentValue.length > 0) {
          // Check if timestamp is already prepended
          const timestampPattern = /^\[[A-Za-z]+ \d+ [A-Za-z]+ \d{4}, \d{1,2}:\d{2} [ap]\.m\. EST, London, Ontario\]/;
          
          if (!timestampPattern.test(currentValue)) {
            const timestamp = formatTimestamp();
            
            // Set the value
            textarea.value = `${timestamp} ${currentValue}`;
            
            // Trigger input and change events to update ChatGPT's internal state
            textarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            
            // Set the textarea's internal value property (for React controlled components)
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLTextAreaElement.prototype,
              'value'
            )?.set;
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(textarea, `${timestamp} ${currentValue}`);
            }
          }
        }
      }
    }, true); // Use capture phase to intercept early
  }

  // Main function to observe and setup
  function init() {
    // Find initial textarea if it exists
    let textarea = findChatInput();
    if (textarea) {
      setupTextareaListener(textarea);
    }

    // Use MutationObserver to detect when textarea appears or is replaced
    const observer = new MutationObserver(function(mutations) {
      const currentTextarea = findChatInput();
      if (currentTextarea && (!textarea || currentTextarea !== textarea)) {
        textarea = currentTextarea;
        setupTextareaListener(textarea);
      }
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

