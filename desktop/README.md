# QuantumSafe Messenger - Desktop App

A desktop application for the QuantumSafe Messenger built with Electron.

## Features

- **Native Desktop Experience**: Runs as a standalone desktop application
- **System Tray Support**: Minimizes to system tray for background operation
- **Native Notifications**: Desktop notifications for new messages
- **Window Management**: Custom window controls and behavior
- **Auto-updater**: Built-in update mechanism for seamless updates

## Prerequisites

- Node.js 16+
- npm or yarn

## Installation

1. Navigate to the desktop directory:
   ```bash
   cd desktop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

1. Start the Next.js development server in the main project:
   ```bash
   cd ..
   npm run dev
   ```

2. In another terminal, start the desktop app:
   ```bash
   cd desktop
   npm run dev
   ```

## Building

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Distribution
Create distributable packages for your platform:
```bash
npm run dist
```

## Platform Support

- **Windows**: `.exe` installer and portable version
- **macOS**: `.dmg` and `.app` bundles
- **Linux**: `.AppImage` and `.deb` packages

## Security Features

- **Sandbox**: Renderer process runs in sandboxed environment
- **Context Isolation**: Secure communication between main and renderer processes
- **Preload Scripts**: Controlled API exposure to renderer process
- **Certificate Pinning**: Built-in SSL certificate validation

## Architecture

```
desktop/
├── main.js          # Main Electron process
├── preload.js       # Secure API bridge
├── index.html       # Desktop app shell
├── package.json     # Dependencies and build config
└── assets/          # Icons and resources
```

## Window Controls

- **Minimize**: Ctrl/Cmd + M
- **Maximize**: Click title bar or use system controls
- **Close**: Ctrl/Cmd + Q or click close button

## Notifications

The app requests permission for desktop notifications on first run. You can manage notification settings in your system preferences.

## Troubleshooting

### App won't start
- Ensure the Next.js server is running on port 3000
- Check that all dependencies are installed
- Verify Node.js version compatibility

### Build fails
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for missing build tools (e.g., Python for node-gyp)

### Notifications not working
- Grant notification permissions in system settings
- Check if notifications are enabled in the app

## Contributing

1. Follow the existing code style
2. Test on multiple platforms when possible
3. Update documentation for any new features
4. Ensure security best practices are maintained

## License

MIT License - see LICENSE file for details.
