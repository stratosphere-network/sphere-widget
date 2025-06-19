# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```

# Sphere ID Payment Widget

A mobile-first widget for redirecting users between different platforms (Telegram Mini App, Web Browser, Mobile App) while preserving payment link data.

## Features

- 🎯 **Mobile-First Design**: Optimized for mobile devices with iOS-like dark theme
- 🔗 **Payment Link Support**: Handles `request_link` and `send_link` formats
- 🔐 **Base64 Decoding**: Automatically decodes and parses JSON data
- 📱 **Platform Selection**: Redirects to Telegram, Web, or Mobile app
- ⚡ **Smart Fallback**: Mobile app tries to open, falls back to web if not installed
- 🎨 **Beautiful UI**: Dark theme with smooth animations and proper accessibility

## How It Works

### **Request Links** (`request_link-${base64}`):

- **Creator**: Person requesting money creates and shares the link
- **Recipient**: Person who opens the link sees "**[Username] requested $50 from you**"
- **Action**: Recipient needs to **PAY** the requested amount
- **Redirect**: Takes recipient to chosen platform to fulfill the payment

### **Send Links** (`send_link-${base64}`):

- **Creator**: Person sending money creates and shares the link
- **Recipient**: Person who opens the link sees "**[Username] sent you $50**"
- **Action**: Recipient needs to **COLLECT** the sent money
- **Redirect**: Takes recipient to chosen platform to claim/collect the payment

## URL Format Support

The widget supports these URL patterns:

```
https://widget.sphere-id.com?data=request_link-${base64_encoded_data}
https://widget.sphere-id.com?data=send_link-${base64_encoded_data}
```

Where `base64_encoded_data` is a base64 encoded JSON with this schema:

```json
{
  "intent": "request", // or "send"
  "id": "unique_nonce_id",
  "amount": 100,
  "username": "user@example.com", // or phone/externalId
  "chain": "ethereum", // or null
  "token": "USDC" // or null
}
```

## Testing Examples

### Request Link Example:

When someone opens this link, they'll see: **"john@example.com requested 50 USDC from you"**

```javascript
const requestData = {
  intent: "request",
  id: "12345-abcde",
  amount: 50,
  username: "john@example.com", // Person requesting money
  chain: "ethereum",
  token: "USDC",
};

const base64Data = btoa(JSON.stringify(requestData));
const testUrl = `http://localhost:5173?data=request_link-${base64Data}`;
console.log(testUrl);
```

### Send Link Example:

When someone opens this link, they'll see: **"+1234567890 sent you 25 MATIC"**

```javascript
const sendData = {
  intent: "send",
  id: "67890-fghij",
  amount: 25,
  username: "+1234567890", // Person who sent the money
  chain: "polygon",
  token: "MATIC",
};

const base64Data = btoa(JSON.stringify(sendData));
const testUrl = `http://localhost:5173?data=send_link-${base64Data}`;
console.log(testUrl);
```

## Configuration

Update the platform URLs in `src/App.tsx`:

```typescript
const platformBaseUrls: PlatformUrls = {
  telegram: "https://t.me/your_sphere_bot",
  web: "https://app.sphere-id.com",
  mobile: "sphereid://",
};
```

## Development

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.
