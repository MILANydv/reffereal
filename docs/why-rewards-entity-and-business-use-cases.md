# Why the Reward Entity Is Needed – Business Explanation & Use Cases

## The Flow You Have Today

1. **Refer** – Someone creates a referral (e.g. gets a link/code).
2. **Click** – Someone else uses that link/code.
3. **Convert** – That same person completes a qualifying action (purchase, booking, sign-up).

At this point you know: “this conversion happened” and “the referrer is owed X” (e.g. $10 or 5% of order). So why do we need a **separate Reward** record instead of just looking at “converted referrals”?

---

## Why a Separate Reward Entity?

### 1. **Conversion = event | Reward = claimable obligation**

- **Referral + Conversion** = “Something happened” (a sale, a booking). It’s an **event**.
- **Reward** = “We owe this person this amount; we will fulfill it.” It’s a **liability** and a **work item**.

Without a Reward record you only know “this referral converted.” You don’t have a clear, auditable list of “what we owe to whom” and “what we’ve already paid.”

### 2. **Lifecycle: PENDING → APPROVED → PAID**

- **PENDING** – Conversion happened; reward is created but not yet approved (e.g. fraud check, policy rules).
- **APPROVED** – Cleared for payout (manual or automatic).
- **PAID** – Money (or credit) has been sent; you record how and when.

Referrals don’t have this lifecycle. Rewards do. That’s what the **Reward** table stores: status, `paidAt`, `payoutReference`, `fulfillmentType`, etc.

### 3. **Fulfillment and how you pay**

Different businesses pay in different ways:

- Cash (bank transfer, PayPal).
- Store credit / wallet balance.
- Voucher, points, or third-party offer.

The **Reward** record is the place to attach:

- **How** you fulfilled (e.g. `fulfillmentType`: CASH, STORE_CREDIT, THIRD_PARTY_OFFER).
- **When** (`paidAt`).
- **Proof** (`payoutReference`, `fulfillmentReference`).

So: **conversion = “sale happened”**, **reward = “we’re going to pay / we paid for that sale.”**

### 4. **Accounting and disputes**

- Finance needs: “How much did we owe in rewards this month?” and “How much did we actually pay?”
- Disputes: “Show me every reward for user X and whether it was paid.”
- Audits: “Prove that this payout corresponds to this conversion.”

That’s much easier when you have **one row per reward** (one per conversion, or per level in multi-level) with status and payout details, instead of inferring everything from referral/conversion events.

### 5. **Multi-level and multiple rewards per referrer**

- One referrer can have many conversions → many rewards.
- In multi-level programs, one conversion can create **two** rewards (level-1 to referrer, level-2 to their referrer).

The **Reward** table gives you one row per “claim”: one row per (conversion + level). That’s what you list on “Rewards & Payouts” and what you mark as paid one by one.

---

## Summary Table

| Concept            | What it represents              | Typical use                          |
|--------------------|---------------------------------|--------------------------------------|
| **Referral**       | Someone shared / used a code    | Tracking who referred, which campaign |
| **Click**          | Someone used the link/code      | Attribution, fraud, conversion window |
| **Conversion**     | Qualifying action happened      | “Sale / booking / sign-up occurred”  |
| **Reward**         | We owe this person this amount  | Payout queue, status, fulfillment    |

So: **conversion = event; reward = obligation to pay (and later, proof that we paid).**

---

## Business Use Cases by Industry

### E‑commerce (e.g. online store)

**Flow**

- Alice refers Bob with a link; Bob clicks and buys a $100 order. Program: “$10 to referrer when friend’s first order converts.”
- **Conversion** = Bob’s first order is placed (and maybe paid).
- **Reward** = “We owe Alice $10.” Created when conversion is recorded.

**Why Reward is needed**

- **Payout batch**: Every week you run “all PENDING/APPROVED rewards” and pay out (PayPal, bank, store credit). You need a list of **rewards**, not a list of “converted referrals” with duplicated logic.
- **Store credit**: You mark reward as PAID and set `fulfillmentType: STORE_CREDIT`, `fulfillmentReference: wallet_credit_123`. Later, support can look up that reward and see how it was fulfilled.
- **Fraud / policy**: You might put rewards in PENDING until risk review, then set to APPROVED. Again, that’s a **reward** lifecycle, not a referral field.
- **Accounting**: “Total rewards expense this month” = sum of rewards **paid** in that period. One table, one source of truth.

**Example**

- 100 conversions in January → 100 reward rows (or 100 + level-2 if multi-level).
- 80 approved and paid → 80 rows with status PAID and `paidAt` set.
- Finance report: sum `amount` where `status = PAID` and `paidAt` in January.

---

### Travel portal (Booking.com–style)

**Flow**

- User refers a friend; friend clicks and books a hotel (e.g. $200). Program: “€15 credit to referrer when friend’s first booking is completed.”
- **Conversion** = first completed booking (e.g. post-checkout or after stay).
- **Reward** = “We owe referrer €15.” One reward per qualifying booking.

**Why Reward is needed**

- **Multiple fulfillment types**: Some rewards as **account credit**, some as **voucher**, some as **bank transfer**. Each reward row stores how **that** reward was fulfilled (`fulfillmentType`, `fulfillmentReference`).
- **Payout cycles**: Travel often pays in batches (e.g. monthly). You query “all rewards in APPROVED for this batch” and send to finance. Without a Reward table you’d be recalculating from conversions every time.
- **Cancellations / policy**: If a booking is cancelled, you might cancel the **reward** (status CANCELLED) instead of deleting the conversion. Conversion stays for analytics; reward reflects “we are not paying this one.”
- **Multi-currency**: Reward has `amount` and `currency`. You can have USD and EUR rewards in the same table and report by currency.

**Example**

- Referrer has 5 conversions in Q1 → 5 reward rows.
- 3 paid as account credit, 2 paid as bank transfer. Each reward row has its own `fulfillmentType` and `fulfillmentReference`.
- Dispute: “I didn’t get my €15 for booking XYZ.” Support looks up reward by conversion/referral, sees status PAID and `fulfillmentReference: credit_txn_456`, and can trace it in the wallet system.

---

## Plan: How Your System Uses This

1. **Conversion happens** (API or app records it)  
   → Create a **Referral** (conversion record) and a **Conversion** row.  
   → Create one (or two, in multi-level) **Reward** row(s): PENDING, with `amount`, `userId`, `referralId`, `conversionId`.

2. **Partner dashboard – “Rewards & Payouts”**  
   → Lists **Reward** rows (not “converted referrals”).  
   → Partner filters by status (PENDING / APPROVED / PAID), user, date.  
   → Partner marks as PAID and optionally sets fulfillment type and reference.

3. **User stats / “Rewards earned”**  
   → Can be computed from **Reward** table (sum of amount by status).  
   → If Reward table is missing or empty, your app can fall back to summing `Referral.rewardAmount` for converted referrals (legacy/display only).  
   → For payouts and accounting, **Reward** is the source of truth.

4. **Backfill (what we added)**  
   → When the Reward table exists but is empty (e.g. migrations ran late), the API can create **Reward** rows from existing CONVERTED referrals so that “Rewards & Payouts” and payout processes have data to work with.

---

## One-Line Summary

**Referral/Conversion = “A conversion happened.”**  
**Reward = “We owe this person this amount; here is its status and how we paid.”**  

The Reward entity is what turns “converted” into “claimable” and “paid” in a way that fits e‑commerce, travel, and most referral payout flows.
