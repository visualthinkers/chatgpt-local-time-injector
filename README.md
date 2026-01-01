# Chat Timestamp Injector

A minimal Chrome extension that automatically prepends a local timestamp to each message typed in the ChatGPT input box before it is sent.

## Features

- Automatically detects ChatGPT input textarea using MutationObserver
- Prepends timestamp in format: `[Day DD Month YYYY, hh:mm a.m./p.m. EST, London, Ontario]`
- Only triggers on Enter key press (Shift+Enter for new lines still works)
- Timezone: America/Toronto (EST)
- Lightweight and scoped to openai.com/chat domains only

## Installation

### Load as Unpacked Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the folder containing the extension files (`manifest.json`, `content.js`, `README.md`)
5. The extension should now be active!

## Usage

1. Navigate to [https://chat.openai.com](https://chat.openai.com) or [https://openai.com/chat](https://openai.com/chat)
2. Type a message in the ChatGPT input box
3. Press Enter (without Shift) to send
4. Your message will automatically have a timestamp prepended before being sent

### Example

If you type: `Hello, how are you?`

It will be sent as: `[Wednesday 31 December 2025, 7:25 p.m. EST, London, Ontario] Hello, how are you?`

## Notes

- The extension only activates on openai.com/chat domains
- Press Shift+Enter for new lines (timestamp will only be added when sending with Enter alone)
- If a timestamp is already present, it won't duplicate
- The extension uses MutationObserver to handle dynamic page changes

## Files

- `manifest.json` - Extension configuration (Manifest v3)
- `content.js` - Main script that handles timestamp injection
- `README.md` - This file

