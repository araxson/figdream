# Payment Architecture Overview

## System Payment Model

### 🎯 Core Payment Philosophy
This platform operates with a **SINGLE automated payment system** - SaaS subscriptions for salon owners. All other transactions are **MANUAL ENTRIES** for record-keeping and analytics purposes only.

## 💳 Automated Payments (Platform Revenue)

### SaaS Subscription Model
**WHO PAYS**: Salon Owners/Managers only
**WHAT**: Monthly/Annual platform subscription fees
**HOW**: Automated billing through Stripe/Payment Gateway
**PURPOSE**: Access to platform features and tools

#### Subscription Tiers (Example)
- **Starter**: $49/month - Single location, up to 5 staff
- **Professional**: $99/month - Multiple locations, unlimited staff
- **Enterprise**: $299/month - Advanced features, API access, priority support

#### Subscription Features Include:
- Appointment scheduling system
- Staff management tools
- Customer database
- Analytics and reporting
- Inventory tracking
- Marketing tools
- Multi-location support (higher tiers)

## 📝 Manual Transaction Recording (NOT Payment Processing)

### Customer Service Transactions
These are **RECORDS ONLY** - no actual payment processing occurs through the platform.

#### What Gets Recorded:
1. **Service Amount**: Base cost of services provided
2. **Product Sales**: Retail products sold
3. **Tips**: Gratuity given to staff
4. **Discounts Applied**: Promotional or loyalty discounts
5. **Payment Method Used**: Cash/Card/Other (for analytics)
6. **Date & Time**: When transaction occurred
7. **Staff Member**: Who provided the service
8. **Customer**: Who received the service

### Recording Process Flow
```
Customer arrives at salon
    ↓
Receives service(s)
    ↓
Pays directly to salon (cash/card/etc)
    ↓
Staff member opens platform
    ↓
Manually enters transaction details:
    - Service: $80 (haircut & color)
    - Products: $25 (shampoo)
    - Tip: $20 (to stylist)
    - Total: $125
    - Payment method: Credit Card
    ↓
Transaction saved for:
    - Commission calculation
    - Analytics/reporting
    - Inventory tracking
    - Customer history
```

## 🔧 Database Tables Involved

### Platform Payments (Automated)
- `financial.subscriptions` - Active SaaS subscriptions
- `financial.invoices` - Platform billing invoices
- `financial.payment_methods` - Stored payment methods for subscriptions

### Transaction Records (Manual)
- `financial.transactions` - Manual transaction entries
- `financial.tips` - Tip records for staff
- `financial.revenue_entries` - Daily revenue tracking
- `financial.commission_payments` - Staff commission calculations

## 📊 Use Cases for Manual Records

### 1. Staff Commissions
Calculate commissions based on services performed:
```sql
-- Example: 40% commission on services, 10% on products
SELECT
    staff_id,
    SUM(service_amount * 0.40) as service_commission,
    SUM(product_amount * 0.10) as product_commission
FROM financial.transactions
WHERE date = CURRENT_DATE
GROUP BY staff_id;
```

### 2. Daily Revenue Reports
Track salon's daily performance:
```sql
-- Daily summary for salon owner
SELECT
    COUNT(*) as total_transactions,
    SUM(service_amount) as total_services,
    SUM(product_amount) as total_products,
    SUM(tip_amount) as total_tips,
    SUM(total_amount) as gross_revenue
FROM financial.transactions
WHERE date = CURRENT_DATE;
```

### 3. Customer Analytics
Understand customer spending patterns:
```sql
-- Customer lifetime value
SELECT
    customer_id,
    COUNT(*) as visit_count,
    AVG(total_amount) as avg_spend,
    SUM(total_amount) as lifetime_value
FROM financial.transactions
GROUP BY customer_id;
```

### 4. Staff Performance Metrics
Track individual staff productivity:
```sql
-- Staff performance dashboard
SELECT
    staff_id,
    COUNT(*) as services_count,
    SUM(service_amount) as revenue_generated,
    AVG(tip_amount) as avg_tip_received
FROM financial.transactions
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY staff_id;
```

## 🚫 What This Platform Does NOT Do

1. **Process customer payments** - No credit card processing for services
2. **Handle POS transactions** - Not a point-of-sale system
3. **Manage cash registers** - No cash drawer integration
4. **Process refunds** - Handled outside the platform
5. **Store customer payment methods** - Only for platform subscriptions

## ✅ What This Platform DOES Do

1. **Records transactions** - For analytics and reporting
2. **Calculates commissions** - Based on recorded amounts
3. **Generates reports** - Revenue, tips, performance metrics
4. **Tracks customer history** - Services received, amounts spent
5. **Manages SaaS billing** - Platform subscription only

## 🔑 Key Benefits of This Approach

1. **Simplicity**: No complex payment processing integration
2. **Flexibility**: Works with salon's existing payment systems
3. **Compliance**: Reduced PCI compliance requirements
4. **Cost-Effective**: No transaction fees on service payments
5. **Independence**: Salons keep their existing payment processors

## 📝 Example Transaction Entry Screen

```
┌─────────────────────────────────────┐
│     Record Transaction              │
├─────────────────────────────────────┤
│ Customer: Jane Doe                  │
│ Staff: Maria (Stylist)              │
│                                     │
│ Services:                           │
│   Haircut................ $45.00    │
│   Hair Color............. $85.00    │
│                                     │
│ Products:                           │
│   Shampoo................ $25.00    │
│                                     │
│ Subtotal:............... $155.00    │
│ Discount:................ -$10.00   │
│ Tip (to Maria):.......... $30.00    │
│ ─────────────────────────────────   │
│ Total:.................. $175.00    │
│                                     │
│ Payment Method: [Credit Card ▼]     │
│                                     │
│ [Save Transaction] [Cancel]         │
└─────────────────────────────────────┘
```

## 🎯 Summary

**Platform Revenue Model**:
- ONE payment system: SaaS subscriptions from salon owners

**Transaction Management**:
- ALL customer payments are handled OUTSIDE the platform
- Platform ONLY records transaction data for:
  - Commission calculations
  - Analytics and reporting
  - Customer relationship management
  - Staff performance tracking
  - Inventory management

This approach keeps the platform focused on being a **management and analytics tool** rather than a payment processor, reducing complexity and allowing salons to maintain their existing payment workflows.