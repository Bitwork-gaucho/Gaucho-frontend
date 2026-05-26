# Gaucho Meat — User Experience Documentation

**Version 1.0 | May 2026**

---

## Overview

Gaucho Meat is a web-based platform that enables Danish customers to purchase high-quality, deep-frozen Argentine beef at significantly lower prices than traditional retailers. The platform achieves this through a batch purchasing model, minimal product variety, no physical storage, and the use of pickup points.

Customers buy into shared batches of meat. Once a batch reaches its target weight, the order is placed with the Argentine supplier and shipped by container vessel to Denmark. Delivery can take up to six weeks. Customers collect their meat from a central pickup point.

The platform serves two distinct user groups: **customers** and **administrators**. All pages and experiences must be fully responsive and work well on mobile devices.

---

## Customer Experience

### 1. Landing Page

The landing page is the first point of contact for new and returning customers. It must clearly communicate the concept, build trust, and motivate action.

**What customers can see:**
- An introduction to the Gaucho Meat concept: affordable Argentine beef with a longer delivery timeline
- A section about the gauchos — Argentine cowboys — with inspiring imagery of ranching culture, open pampas, and high-quality beef on the grill
- An explanation of the environmental benefits of Argentine grass-fed ranching compared to conventional Danish beef production
- Detailed information on how to handle, store, and prepare the meat after pickup
- Proof of approval from Danish food authorities, confirming Gaucho Meat is a licensed food supplier
- Pricing emphasis: the value proposition of cheap, high-quality Argentine meat
- Standard informational pages accessible from navigation: About, Contact, Terms & Conditions, Privacy Policy

**What customers can do:**
- Click a primary **"Buy Now"** button that takes them directly to an active batch if one exists
- Click a secondary **"Show Me More"** button that takes them to the full batch list where they can browse active and upcoming batches

---

### 2. Batch List Page

Displays all available batches so customers can decide which to join or follow.

**What customers can see:**
- All active batches they can currently buy into
- All upcoming batches that are planned but not yet open for purchase
- For each batch: meat type, batch size, current progress toward the target weight, and current status

**What customers can do:**
- Click on an active batch to go to the Batch Detail Page
- Click on an upcoming batch to show interest by providing their email address, adding them to a notification list for when that batch opens

---

### 3. Batch Detail Page

The core transactional page where customers learn about, buy into, and track a specific batch. If only one active batch exists, customers are taken here directly from the landing page.

**What customers can see:**
- A description of the meat type being sold (e.g. 250g ribeye steaks)
- A visual progress indicator showing kilos sold versus the total batch target — clearly and compellingly displayed to motivate action
- The current batch status: Waiting to Fill / Ordered / In Transit / At Customs / Ready for Pickup
- A social motivation element encouraging customers to invite others to fill the batch faster, so it gets ordered sooner
- If logged in: the customer's own order details — kilos purchased, amount paid, and an option to cancel

**What customers can do:**
- Select a quantity using easy preset amounts (1 kg, 2 kg, 3 kg, 5 kg, 10 kg) that can be combined to reach any desired total
- See their running total before committing to payment
- Proceed to payment
- Share the batch with friends and family via a copy-and-share link suitable for social media, email, or text messages
- Log in with their email address and a one-time verification code to view their personal order details
- Cancel their order (with a warning about the impact on the batch, especially if in transit)
- Join a waiting list if the active batch is already full

---

### 4. Payment & Confirmation

**What customers receive after payment:**
- A confirmation email containing:
  - A summary of what they purchased
  - A payment receipt with a barcode
  - A link back to the batch page to track progress
  - An encouragement to invite friends and family to help fill the batch faster

---

### 5. Batch Tracking & Notifications

After purchase, customers receive automatic email notifications at key milestones and can track the batch at any time by following the link in their email or logging in.

**Email notifications are sent when:**
- The batch reaches 50% of the target weight
- The batch reaches 75% of the target weight
- The batch is fully sold — order is placed with the Argentine supplier
- The shipment enters Danish customs — with an updated estimated clearance time
- The shipment is cleared from customs and a pickup window is confirmed — with exact date, time, and location

---

### 6. Shipment Tracking View (In Transit)

Once the batch is ordered and on its way, the batch page transforms into a shipment tracking experience.

**What customers can see:**
- A live map showing the shipment's current location and journey from Argentina to Copenhagen — visualised in a clean, sophisticated, and memorable way
- The estimated delivery date and remaining transit time
- A clear visual indicator of progress along the journey
- When in customs: a status update and estimated clearance time (typically 1–3 days)

---

### 7. Pickup Experience

**What customers need to bring:**
- Their payment receipt on their phone (with the barcode visible)
- An insulated container to keep the meat frozen during transport home

**What happens at pickup:**
- Customer shows their barcode receipt to staff
- Staff scans the barcode, which automatically marks the order as delivered in the system
- Customer collects their meat — transaction complete

---

### 8. Cancellation Policy

- Customers can cancel their order at any time free of charge
- If cancellation occurs while the batch is in transit, a stronger warning is shown explaining the impact on other batch members and encouraging them to wait — they are getting great meat at an unbeatable price
- Upon cancellation, the payment is refunded and the freed slot becomes available to customers on the waiting list
- Waiting list members are notified when a slot opens up

---

## Administrator Experience

Administrators have access to an enhanced version of the same website. The batch pages and batch list page look similar to the customer view but include additional management tools and controls.

---

### 1. Batch List Page (Administrator)

**What administrators can see:**
- All active, upcoming, and completed batches
- Status and progress summary for each batch

**What administrators can do:**
- Create a new batch by entering:
  - Batch name
  - Total batch size (e.g. 500 kg)
  - Meat type and description
  - Minimum purchase amount per customer
  - Price per kilo or per steak
- Edit an existing batch's details
- Delete a batch
- Click into any batch to manage it

---

### 2. Batch Management Page (Administrator)

The main operational view for managing an individual batch throughout its lifecycle.

**Batch status management:**
- Set the batch to **Ordered** — triggers a one-click order confirmation and notifies all customers
- Set the batch to **In Transit** and enter shipment details
- Set the batch to **At Customs** — triggers customer notifications with estimated clearance time
- Set the batch to **Ready for Handover** — the administrator picks up the meat from customs
- Set the **pickup date and time window** — automatically notifies all customers with exact pickup details

**Shipment details the administrator can enter:**
- Supplier name (Argentine producer)
- Logistics company name
- Customs agent name (if applicable)
- Key contact names and details
- Ship or container identifier (used for live tracking integration)
- Price paid for the order
- Any other relevant order details

**Payment overview:**
- List of all customers who have paid, including their email addresses and amounts paid
- Progress overview showing total amount collected versus target
- Ability to send an email to a specific customer or a selected group of customers
- One-click refunds for individual customers or bulk refunds for a selected group

---

### 3. Shipment Tracking (Administrator)

- Live shipment location pulled automatically from the logistics company's API or a ship tracking service, using the vessel or container identifier
- Estimated delivery date and transit progress
- Alerts if the delivery timeline is exceeded
- If customs or the logistics company sends an automated status update, the batch status updates automatically and both the administrator and all customers are notified
- If no automated update is available, the administrator can manually input a customs clearance estimate

---

### 4. Temperature Monitoring (Administrator Only)

- Administrators can set acceptable temperature thresholds for the shipment during transit
- If the temperature falls below or exceeds the defined limits, an automatic email alert is sent to the administrator
- This feature is not visible to customers

---

### 5. Barcode Scanning at Pickup

- The administrator or staff member uses a barcode scanning tool within the app on their phone
- When a customer's payment receipt barcode is scanned, the system automatically marks that customer's order as delivered
- No manual steps required — the confirmation is handled automatically in the backend

---

### 6. Batch History & Analytics

- Administrators can view all completed batches and their full historical data
- Data stored includes: time from batch creation to full payment, total payment timeline, meat type, supplier, logistics provider, number of customers, number of deliveries completed, and other relevant metrics
- This data supports performance analysis, planning of future batches, and ongoing improvement of the customer experience

---

## Batch Status Flow

The following states represent the full lifecycle of a batch, visible to both customers and administrators:

| Status | Description |
|---|---|
| **Waiting to Fill** | The batch is open for purchase. Customers can buy in. Progress is shown as kilos sold versus target. |
| **Ordered** | The batch has reached its target weight. The order has been confirmed with the Argentine supplier. |
| **In Transit** | The shipment is on its way from Argentina to Denmark. Live tracking is available. |
| **At Customs** | The shipment has arrived in Copenhagen and is being processed through Danish customs. Estimated clearance time is shown. |
| **Ready for Pickup** | The meat has cleared customs and been delivered to the pickup point. Customers are notified with the exact pickup date and time window. |
| **Completed** | All orders have been collected and confirmed by barcode scan. Batch is archived. |

---

## Design & Implementation Notes

- All pages must be fully responsive and provide an excellent experience on mobile devices
- The visual design should be clean, sophisticated, and aimed at adult consumers — not playful or cartoonish
- The shipment map visualisation should be distinctive and memorable, but remain tasteful and polished
- Authentication uses a passwordless email code flow — no passwords required
- The gamification and social elements (batch progress, sharing, urgency) should feel natural and motivating without being aggressive
- The platform must comply with all Danish food import and e-commerce regulations
