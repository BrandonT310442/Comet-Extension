# Vue Auth Chrome Extension

This is a Chrome extension for authentication built with Vue.js.

## Development Setup

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npm run dev
```

3. Start the backend server:
```
npm run server
```

4. Or run both simultaneously:
```
npm run dev:all
```

## Building the Extension

1. Build the extension:
```
npm run build:extension
```

2. The extension will be built in the `extension` directory.

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `extension` directory
4. The extension should now be loaded and ready to use

## Features

- User authentication (login/signup)
- Google OAuth integration
- Email verification
- Secure storage of user data

## Notes

- The extension uses Chrome's storage API to persist user sessions
- Backend server needs to be running at http://localhost:3000 for API calls
- Replace the placeholder icons in `public/icons/` with your own icons before distribution

## Customizing the Extension

You can modify the Vue components to customize the extension's appearance and functionality:

- `Auth.vue`: The main authentication page
- `Dashboard.vue`: The dashboard shown after successful login
- `main.js`: The entry point for the application
- `manifest.json`: The extension's configuration file 