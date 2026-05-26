# Gaucho Meat — Frontend Technical Design Document

**Version 1.0 | May 2026**

---

## Overview

This document describes the technical frontend architecture for the Gaucho Meat web application. It covers the component structure, design principles, navigation patterns, mobile-first approach, and the mock backend service layer. It does not describe implementation details of the real backend — those are covered in a separate document.

The application is a **Single Page Application (SPA)** built with a modern JavaScript framework (e.g. React). It serves two distinct user types — customers and administrators — through a shared codebase with role-based rendering.

---

## Core Design Principles

### 1. Mobile-First
The application is designed for mobile screens first, then scaled up for tablet and desktop. All layout, navigation, spacing, and interaction patterns must work excellently on a small touchscreen before being enhanced for larger screens.

### 2. Single Responsibility
Every component has one clearly defined job. Components that do too much must be split. This makes components easier to understand, test, and reuse.

### 3. Reusability
UI components are generic and reusable wherever possible. They receive data via props and emit events via callbacks. They have no knowledge of the application's business logic or data sources.

### 4. Separation of Concerns
The codebase is strictly separated into three layers:
- **UI layer** — presentational components that render data and capture user interactions
- **Container layer** — components that manage state, handle logic, and pass data to UI components
- **Service layer** — the mock backend that handles all data fetching, mutation, and external integrations

### 5. Consistency
A shared design token system (colours, spacing, typography, border radii, shadows) ensures visual consistency across all components. No hardcoded style values appear inside components.

### 6. Progressive Enhancement
The app loads and displays meaningful content as quickly as possible. Interactive features are layered on top. Images and non-critical assets are lazy-loaded.

---

## Technology Choices

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React | Component model, ecosystem, and tooling maturity |
| Styling | CSS Modules or Tailwind CSS | Scoped styles, no class name collisions, easy theming |
| State Management | React Context + hooks (useState, useReducer) | Sufficient for this app's complexity without Redux overhead |
| Routing | React Router | Standard SPA routing with declarative route definitions |
| HTTP / Service calls | Service layer abstraction (see Mock Backend) | Decouples frontend from backend implementation |
| Build tooling | Vite | Fast development server, optimised production builds |
| Code quality | ESLint + Prettier | Consistent code style enforced automatically |

---

## Directory Structure

The project follows a feature-based directory structure. Each feature or page has its own folder containing its components, containers, and styles. Shared components live in a global `components` folder.

```
src/
├── assets/                  # Static assets: images, icons, fonts
├── components/              # Globally reusable UI components
│   ├── Button/
│   ├── ProgressBar/
│   ├── StatusBadge/
│   ├── Map/
│   ├── Modal/
│   ├── Notification/
│   ├── ShareButton/
│   ├── BarcodeScanner/
│   └── ...
├── containers/              # Global container components (auth, layout)
│   ├── AppShell/
│   └── AuthGate/
├── features/                # Feature-based modules
│   ├── landing/
│   │   ├── LandingPage.jsx
│   │   └── components/
│   ├── batches/
│   │   ├── BatchListPage.jsx
│   │   ├── BatchDetailPage.jsx
│   │   ├── BatchDetailContainer.jsx
│   │   └── components/
│   │       ├── BatchCard/
│   │       ├── BatchProgress/
│   │       ├── QuantitySelector/
│   │       └── ShipmentTracker/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── components/
│   └── admin/
│       ├── AdminBatchList.jsx
│       ├── AdminBatchDetail.jsx
│       ├── AdminBatchDetailContainer.jsx
│       └── components/
│           ├── BatchForm/
│           ├── PaymentOverview/
│           ├── CustomerList/
│           └── TemperatureMonitor/
├── services/                # Mock backend service layer
│   ├── index.js             # Exports all services
│   ├── authService.js
│   ├── batchService.js
│   ├── shipmentService.js
│   └── paymentService.js
├── hooks/                   # Custom React hooks
│   ├── useBatch.js
│   ├── useAuth.js
│   └── useShipment.js
├── context/                 # React Context providers
│   ├── AuthContext.jsx
│   └── BatchContext.jsx
├── tokens/                  # Design tokens
│   └── tokens.css           # CSS custom properties for colours, spacing, etc.
├── router/                  # Route definitions
│   └── AppRouter.jsx
└── App.jsx                  # Root component
```

---

## Component Architecture

### Presentational Components

Presentational components are pure UI. They receive data via props, render it visually, and call callback functions when the user interacts with them. They have no knowledge of where data comes from or how it is stored.

**Rules for presentational components:**
- Accept data and callbacks as props only
- No direct calls to services or APIs
- No business logic
- Easily testable in isolation
- Reusable across multiple features

**Example:** `BatchProgress` — receives `soldKilos` and `targetKilos` as props, renders a visual progress bar. It does not know what batch it belongs to.

### Container Components

Container components manage state and orchestrate data. They call services, handle loading and error states, and pass data down to presentational components.

**Rules for container components:**
- One container per page or major feature section
- Call services via the service layer only — never directly to an API
- Pass data and callbacks to child presentational components
- Handle loading, error, and empty states

**Example:** `BatchDetailContainer` — fetches batch data from `batchService`, manages the purchase flow state, and passes everything down to `BatchDetailPage` and its child components.

### Custom Hooks

Reusable logic that doesn't belong in a specific component is extracted into custom hooks. Hooks handle things like data fetching, form state, and device detection.

**Example:** `useBatch(batchId)` — fetches and returns batch data, loading state, and error state. Used by any container that needs batch data.

---

## Navigation

### Desktop
A fixed top navigation bar provides access to the main sections of the app. Navigation items are clearly labelled and highlighted based on the active route.

### Mobile
A fixed bottom navigation bar replaces the top nav on small screens. It uses icon and label combinations for the main navigation destinations. This keeps navigation within comfortable thumb reach.

### Key navigation destinations (customer):
- Home (landing page)
- Batches (batch list)
- My Order (personal order tracking — requires login)

### Key navigation destinations (administrator):
- Batches (admin batch list)
- Pickup Scanner (barcode scanning tool)

### Routing
All routes are defined centrally in `AppRouter.jsx`. Route guards protect administrator routes and personal order pages. Unauthenticated users accessing protected routes are redirected to the email login flow.

---

## Mobile-First Interaction Design

The application embraces native mobile interaction patterns to create a natural, fluid experience on small screens.

### Principles:
- **Touch targets** are a minimum of 44×44px to be easily tappable
- **Swipe gestures** are used where appropriate — e.g. swiping between batch states or dismissing modals
- **Scroll-based layouts** are preferred over paginated navigation for content-heavy views
- **Bottom sheets** are used for contextual actions and detail views instead of full-page modals on mobile
- **Skeleton screens** are shown during data loading rather than spinners, to reduce perceived wait time
- **Lazy loading** is applied to images and non-critical components
- **Single-column layouts** are the default, expanding to multi-column on larger screens

### Responsive breakpoints:
| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 768px | Single column, bottom nav |
| Tablet | 768px – 1024px | Two column where appropriate, bottom or top nav |
| Desktop | > 1024px | Multi-column, top nav |

---

## Design Tokens

All visual constants are defined as CSS custom properties in `tokens/tokens.css`. No component may use hardcoded colour, spacing, or typography values.

```css
/* Example token categories */
--color-primary
--color-primary-dark
--color-accent
--color-background
--color-surface
--color-text
--color-text-muted
--color-success
--color-warning
--color-error

--spacing-xs
--spacing-sm
--spacing-md
--spacing-lg
--spacing-xl

--font-size-sm
--font-size-base
--font-size-lg
--font-size-xl
--font-size-2xl

--border-radius-sm
--border-radius-md
--border-radius-lg

--shadow-sm
--shadow-md
--shadow-lg
```

This token system makes it straightforward to restyle the entire application or introduce a dark mode by changing token values in one place.

---

## Mock Backend Service Layer

### Purpose

The mock backend is a JavaScript service layer that sits between the frontend and the real backend. It provides all the data and functionality the frontend needs, using hardcoded or locally generated data. When the real backend is ready, each mock service is replaced with a real implementation — the frontend code does not change.

### Architecture

All services are organised into logical modules under `src/services/`. Each module exports an object with async functions that mirror the real API endpoints the backend will eventually provide. The frontend always calls these service functions — never a raw API URL.

### Service Modules

#### `authService.js`
Handles authentication flows.

| Function | Description |
|---|---|
| `requestLoginCode(email)` | Sends a one-time login code to the given email |
| `verifyLoginCode(email, code)` | Verifies the code and returns a session token |
| `getSession()` | Returns the current session if one exists |
| `logout()` | Clears the current session |

#### `batchService.js`
Handles all batch-related data and operations.

| Function | Description |
|---|---|
| `getActiveBatches()` | Returns a list of all active batches |
| `getUpcomingBatches()` | Returns a list of all upcoming batches |
| `getCompletedBatches()` | Returns a list of completed batches (admin only) |
| `getBatchById(batchId)` | Returns full details for a single batch |
| `getOrderByBatchAndUser(batchId, userId)` | Returns the current user's order for a batch |
| `registerInterest(batchId, email)` | Registers interest in an upcoming batch |
| `joinWaitingList(batchId, userId)` | Adds user to waiting list for a full batch |
| `createOrder(batchId, userId, kilos)` | Creates a new order for a batch |
| `cancelOrder(orderId)` | Cancels an order and triggers refund |
| `createBatch(batchData)` | Creates a new batch (admin only) |
| `updateBatch(batchId, batchData)` | Updates batch details (admin only) |
| `deleteBatch(batchId)` | Deletes a batch (admin only) |
| `setBatchStatus(batchId, status)` | Updates the status of a batch (admin only) |
| `setPickupWindow(batchId, date, timeWindow)` | Sets the pickup date and time (admin only) |
| `getPaymentOverview(batchId)` | Returns all customer orders for a batch (admin only) |

#### `paymentService.js`
Handles payment processing and refunds.

| Function | Description |
|---|---|
| `processPayment(orderId, paymentDetails)` | Processes payment for an order |
| `issueRefund(orderId)` | Issues a refund for a cancelled order |
| `bulkRefund(orderIds)` | Issues refunds for multiple orders (admin only) |
| `getReceipt(orderId)` | Returns the payment receipt including barcode data |
| `confirmDelivery(orderId)` | Marks an order as delivered via barcode scan (admin only) |

#### `shipmentService.js`
Handles shipment tracking and external integrations.

| Function | Description |
|---|---|
| `getShipmentLocation(shipmentId)` | Returns current coordinates from tracking API |
| `getShipmentETA(shipmentId)` | Returns estimated arrival date and time |
| `getShipmentStatus(shipmentId)` | Returns current shipment status |
| `getTemperatureLog(shipmentId)` | Returns temperature readings during transit (admin only) |
| `setTemperatureThresholds(min, max)` | Sets alert thresholds for temperature monitoring (admin only) |

### Replacing the Mock

When the real backend is ready, each service file is replaced with a real implementation that calls the actual API. The function signatures remain identical. The rest of the frontend is unaffected.

For example, replacing `batchService.js` with a Firebase implementation means:
1. Copy the existing mock `batchService.js`
2. Replace each function body with a real Firebase call
3. Export the same function names
4. The entire frontend continues to work without modification

---

## State Management

For this application, React's built-in state management tools are sufficient:

- **`useState`** — local component state (form inputs, toggles, UI state)
- **`useReducer`** — complex state with multiple sub-values (e.g. batch purchase flow)
- **`useContext`** — global state shared across components (authentication session, current user)
- **Custom hooks** — reusable stateful logic (data fetching, form handling)

Global state is minimal. Most state lives close to where it is used. Context is used sparingly — only for truly global concerns like the current user session.

---

## Authentication

Authentication is passwordless. Users provide their email address and receive a one-time verification code. The session is stored locally and passed to the service layer for authenticated requests.

- No passwords are stored or transmitted
- Sessions expire after a defined period
- Administrator access is determined by the user's role, returned from `authService.getSession()`
- Protected routes check for a valid session via `AuthGate` and redirect unauthenticated users

---

## Error Handling & Loading States

Every data-fetching operation must handle three states:

1. **Loading** — show a skeleton screen or loading indicator
2. **Success** — render the data
3. **Error** — show a clear, friendly error message with a retry option

Error boundaries are used at the page level to catch unexpected errors and prevent the entire app from crashing.

---

## Performance Considerations

- Images are lazy-loaded and served in modern formats (WebP)
- Route-based code splitting ensures only the code needed for the current page is loaded
- Static assets are cached aggressively
- The shipment map component is loaded asynchronously only when needed
- Skeleton screens are preferred over spinners to improve perceived performance

---

## Accessibility

- All interactive elements are keyboard accessible
- Touch targets are a minimum of 44×44px
- Colour contrast meets WCAG AA standards
- Screen reader labels are provided for icon-only buttons
- Focus management is handled correctly after navigation and modal interactions

---

## Future Considerations

- **Real backend integration** — replace mock services one by one with real implementations (e.g. Firebase)
- **Push notifications** — supplement email notifications with browser push notifications
- **Gamification layer** — batch speed records, leaderboards, social sharing incentives
- **Analytics** — track key user flows to identify drop-off points and optimise conversion
- **Internationalisation** — support for Danish and English language switching
