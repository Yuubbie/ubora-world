# Applying the Phase 2 patch

This adds: real Paystack payments, a subscribe/pricing page, and the admin
content-approval queue.

## 1. Extract and merge

Extract this zip, then copy every file/folder inside it into your
`ubora-world` project folder, **overwriting when prompted**. These files
replace or add to what's already there — they won't touch `node_modules` or
your `.env`.

## 2. Two manual edits (not included in the zip, to protect your setup)

**`package.json`** — add one line. Open it and find:
```json
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
```
Change it to:
```json
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:expire-subscriptions": "tsx scripts/expireSubscriptions.ts"
```

**`.env`** — add your Paystack test secret key. Get it free from your
Paystack dashboard (sign up at paystack.com, it's free — Settings > API Keys
& Webhooks > use the **Test Secret Key**, starts with `sk_test_`). Add this
line:
```
PAYSTACK_SECRET_KEY="sk_test_your_real_key_here"
```

## 3. Apply the schema changes

The data model changed (added `pending` payment status, and approval audit
fields to Summary/PastQuestionSet/TutorialContent). Run:
```
npm run db:migrate
```
Name it `phase2`.

## 4. Re-seed

The seed script now also creates an admin account and a draft item to test
approvals with:
```
npm run db:seed
```

New logins:
- Admin: `demo.admin@uboraworld.test` / `Admin123!`
- Student: unchanged from Phase 1

## 5. Restart the dev server

```
npm run dev
```

## What to test

1. Log in as the **admin** account, visit `/admin/content` — you should see
   one draft summary waiting for approval. Click Approve.
2. Log in as the **student** account, visit `/subscribe` — pick a plan, it
   redirects to a real (test-mode) Paystack checkout page.
3. Use Paystack's test card to "pay": card number `4084084084084081`, any
   future expiry, CVV `408`, any PIN/OTP if asked.
4. You should land back on `/subscribe/callback`, which confirms the payment
   directly (no need for a public webhook URL while testing locally) and
   activates your subscription.
