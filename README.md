# Sphere ID Payment Widget

## What This Widget Does

This is a **mobile-first platform selection widget** for Sphere ID payment links that allows users to seamlessly choose how they want to handle payment requests and money transfers across different platforms.

### Core Functionality

**🔗 Payment Link Processing:**

- Receives specially formatted URLs containing base64-encoded payment data
- Supports two types of payment links:
  - **Request Links** (`request_link-${base64}`): When someone requests money from you
  - **Send Links** (`send_link-${base64}`): When someone sends money to you
- Automatically decodes and validates the payment information

**💰 Transaction Display:**

- Shows clear, user-friendly transaction details including:
  - Payment amount and token type (USDC, ETH, MATIC, etc.)
  - Blockchain network (Ethereum, Polygon, etc.)
  - Sender/requester information
  - Transaction ID for tracking
- Adapts the interface based on whether you need to **pay** a request or **collect** sent money

**📱 Platform Selection:**

- Provides three platform options for completing the transaction:
  - **Telegram Mini App**: Seamlessly opens in Telegram with payment flow
  - **Web Browser**: Continues the transaction in your web browser
  - **Mobile App**: Attempts to open the native Sphere ID mobile app (with web fallback)
- Each platform receives the complete original payment data to continue the transaction

**🔄 Smart Redirection:**

- Integrates with Sphere ID backend API to get current platform URLs
- Constructs platform-specific URLs with proper query parameters:
  - Telegram: `?startapp=request_link-${data}`
  - Web/Mobile: `?data=request_link-${data}`
- Handles mobile app detection and fallback scenarios

### User Experience

1. **User receives a payment link** via message, email, or any sharing method
2. **Opens the link** which loads this widget in their mobile browser
3. **Sees transaction details** - who's requesting/sending money and how much
4. **Chooses their preferred platform** to complete the payment or collection
5. **Gets redirected** to the chosen platform with all payment data preserved

### Technical Features

- **Mobile-First Design**: Optimized for touch interfaces with iOS-like dark theme
- **Real-time API Integration**: Fetches current platform URLs from Sphere backend
- **Error Handling**: Graceful error states with retry functionality
- **Accessibility**: Proper focus states and reduced motion support
- **Type Safety**: Full TypeScript implementation with comprehensive interfaces

This widget acts as a **universal payment link router** that ensures users can always access Sphere ID payment functionality regardless of their device or platform preference.

---
