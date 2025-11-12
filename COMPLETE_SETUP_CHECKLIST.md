# 🎯 COMPLETE SETUP CHECKLIST - Everything You Need

**Goal:** Use this exact platform for YOUR business with YOUR services, then sell it to clients.

## 📦 WHAT YOU ALREADY HAVE

✅ **GitHub Repo:** https://github.com/theonlypal/roof-king-manager
✅ **Vercel Deployment:** https://roof-king-manager.vercel.app
✅ **Code:** All automation built, tested, deployed
✅ **Brevo API:** Already configured (from previous setup)
✅ **Gemini API:** Already configured (from previous setup)

---

## 🔑 WHAT YOU NEED TO GET (3 Services)

### 1. AIRTABLE (5 min) - Your Universal Database

**Why:** Stores ALL customer/job data accessible anywhere, beats Excel/Google Sheets

**Get:**
- **Airtable Personal Access Token** (starts with `pat...`)
- **Airtable Base ID** (created by my script, starts with `app...`)
- **Business ID** (created by my script, like `business-1736612345`)

**How:**
1. Go to: https://airtable.com/signup (free account)
2. Go to: https://airtable.com/create/tokens
3. Click "Create new token"
4. Name: `Roof King Automation`
5. Add 4 scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`
   - `schema.bases:write`
6. Access: "All current and future bases"
7. Click "Create token"
8. **COPY THE TOKEN**

Then run MY script (I create your base automatically):
```bash
cd "C:/Users/Rayan Pal/Desktop/roof-king-manager"
node scripts/setup-airtable.js pat_YOUR_TOKEN_HERE
```

**Script outputs 3 lines** → Copy them for .env

---

### 2. GOOGLE CALENDAR (10 min) - Auto-Scheduling

**Why:** Jobs automatically appear on calendar, sends notifications to you AND customer

**Get:**
- **Service Account Email** (like `xyz@roofkingbot-123.iam.gserviceaccount.com`)
- **Private Key** (long JSON key from downloaded file)
- **Calendar ID** (your Roof King calendar, like `abc123@group.calendar.google.com`)

**How:**

**Part A: Create Service Account**
1. https://console.cloud.google.com
2. "Select a project" → "NEW PROJECT"
3. Name: `RoofKingBot` → CREATE
4. "APIs & Services" → "ENABLE APIS AND SERVICES"
5. Search: `Google Calendar API` → ENABLE
6. "Credentials" → "CREATE CREDENTIALS" → "Service account"
7. Name: `roof-king-calendar-bot` → CREATE AND CONTINUE → DONE
8. Click the service account → "KEYS" → "ADD KEY" → "Create new key" → JSON → CREATE
9. **SAVE THE JSON FILE** (contains email + private key)

**Part B: Create & Share Calendar**
10. Open JSON file → copy the `client_email` value
11. https://calendar.google.com
12. "+" next to "Other calendars" → "Create new calendar"
13. Name: `Roof King Jobs` → Create
14. Find it in sidebar → ⚙️ → "Settings and sharing"
15. "Share with specific people" → paste service account email
16. Permission: "Make changes to events" → Send
17. Scroll up → copy "Calendar ID" (under "Integrate calendar")

---

### 3. BREVO EMAIL (Already Done ✅)

You already have:
- `BREVO_API_KEY`
- `APP_FROM_EMAIL`
- `APP_FROM_NAME`

---

## 📝 LOCAL SETUP (Test Before Deploying)

### Step 1: Create .env File

```bash
cd "C:/Users/Rayan Pal/Desktop/roof-king-manager"
cp .env.example .env
```

### Step 2: Fill in .env

Open `.env` and replace EVERYTHING:

```env
# ============================================
# EXISTING APIS (YOU ALREADY HAVE THESE)
# ============================================

BREVO_API_KEY=xkeysib-YOUR_EXISTING_KEY
GEMINI_API_KEY=AIzaSy-YOUR_EXISTING_KEY

# ============================================
# YOUR BUSINESS BRANDING
# ============================================

APP_FROM_EMAIL=your-email@gmail.com
APP_FROM_NAME=Rayan Pal

APP_COMPANY_NAME=Roof King Roofing & Solar
APP_COMPANY_EMAIL=office@sandiegoroofking.com
APP_COMPANY_PHONE=(760) 941-5464
APP_COMPANY_ADDRESS=San Diego, CA

APP_DEFAULT_TAX_RATE=0.0775

NEXT_PUBLIC_APP_COMPANY_EMAIL=office@sandiegoroofking.com

# ============================================
# AUTOMATION (NEW - FROM STEPS ABOVE)
# ============================================

# From Airtable script output:
AIRTABLE_API_KEY=pat_YOUR_TOKEN_FROM_AIRTABLE
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_BUSINESS_ID=business-1736612345

# From Google Calendar JSON file:
GOOGLE_SERVICE_ACCOUNT_EMAIL=roof-king-calendar-bot@roofkingbot-xxxxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...(ENTIRE KEY FROM JSON FILE)...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=abc123def456@group.calendar.google.com
GOOGLE_CALENDAR_TIMEZONE=America/Los_Angeles

# Automation toggles:
AUTOMATION_ENABLED=true
AUTO_CREATE_CALENDAR_EVENTS=true
AUTO_SEND_CONFIRMATION_EMAILS=true
DEFAULT_JOB_DURATION_HOURS=4
```

**CRITICAL for GOOGLE_PRIVATE_KEY:**
- Open the JSON file you downloaded
- Find the `"private_key"` field
- Copy the ENTIRE value (including `\n` characters)
- Paste it between the quotes in .env
- Should look like: `"-----BEGIN PRIVATE KEY-----\nMIIEv...(long string)...\n-----END PRIVATE KEY-----\n"`

---

### Step 3: Test Locally

```bash
# Install dependencies (if not already)
npm install

# Run test script
npm install dotenv
node scripts/test-automation.js
```

**Expected output:**
```
🚀 ROOF KING AUTOMATION TEST SUITE

📊 Testing Airtable...
  ├─ Creating test customer...
  ├─ ✓ Customer created: recXXXXXXXXXXXXXX
  ├─ Creating test job...
  └─ ✓ Job created: recXXXXXXXXXXXXXX

  View in Airtable: https://airtable.com/appXXXXXXXXX

📅 Testing Google Calendar...
  ├─ Service account configured ✓
  └─ Calendar ID: abc123@group.calendar.google.com

📧 Testing Brevo Email...
  ├─ ✓ Brevo account: your-email@gmail.com
  └─ Credits remaining: 300/day

✅ Core automation is working!
```

**If you see this:** ✅ Everything works! Continue.
**If errors:** Check .env file, make sure no placeholder values remain.

---

### Step 4: Run Locally & Test

```bash
npm run dev
```

Open: http://localhost:3000/demo

**Test the full flow:**
1. Click "Try It Now"
2. Fill form with YOUR real data:
   - Customer Email: YOUR EMAIL
   - Scheduled Date: Tomorrow 10 AM
3. Click "Create Job"
4. **Watch magic happen:**
   - ✅ Open Airtable → see customer + job
   - ✅ Open Google Calendar → see event tomorrow 10 AM
   - ✅ Check YOUR email → confirmation arrives
   - ✅ Check phone → calendar notification

**If all 4 work:** 🎉 YOU'RE DONE LOCALLY. Move to deployment.

---

## 🚀 VERCEL DEPLOYMENT (Production)

### Step 1: Verify GitHub is Up to Date

```bash
cd "C:/Users/Rayan Pal/Desktop/roof-king-manager"
git pull origin main
git status
```

Should say: "Your branch is up to date with 'origin/main'"

---

### Step 2: Add Environment Variables to Vercel

1. Go to: https://vercel.com/dashboard
2. Find your project: `roof-king-manager`
3. Click "Settings"
4. Click "Environment Variables" (left sidebar)
5. **Add EACH variable from your .env file:**

**Click "Add" for each one:**

```
BREVO_API_KEY = xkeysib-YOUR_KEY
GEMINI_API_KEY = AIzaSy-YOUR_KEY
APP_FROM_EMAIL = your-email@gmail.com
APP_FROM_NAME = Rayan Pal
APP_COMPANY_NAME = Roof King Roofing & Solar
APP_COMPANY_EMAIL = office@sandiegoroofking.com
APP_COMPANY_PHONE = (760) 941-5464
APP_COMPANY_ADDRESS = San Diego, CA
APP_DEFAULT_TAX_RATE = 0.0775
NEXT_PUBLIC_APP_COMPANY_EMAIL = office@sandiegoroofking.com
AIRTABLE_API_KEY = pat_YOUR_TOKEN
AIRTABLE_BASE_ID = appXXXXXXXXXXXXXX
AIRTABLE_BUSINESS_ID = business-1736612345
GOOGLE_SERVICE_ACCOUNT_EMAIL = roof-king-calendar-bot@roofkingbot-xxxxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID = abc123@group.calendar.google.com
GOOGLE_CALENDAR_TIMEZONE = America/Los_Angeles
AUTOMATION_ENABLED = true
AUTO_CREATE_CALENDAR_EVENTS = true
AUTO_SEND_CONFIRMATION_EMAILS = true
DEFAULT_JOB_DURATION_HOURS = 4
```

**For each variable:**
- Make sure "Production", "Preview", "Development" are ALL checked
- Click "Save"

---

### Step 3: Redeploy

Go to "Deployments" tab → Click "..." on latest deployment → "Redeploy"

**Wait 2 minutes** → Status should show "Ready"

---

### Step 4: Test Production

Go to: https://roof-king-manager.vercel.app/demo

**System Status should show:**
- ✅ Airtable Database: Connected
- ✅ Google Calendar: Connected
- ✅ Email Service: Connected
- ✅ Automation: Enabled

Click "Try It Now" → Create a real job → Same magic happens!

---

## 🎯 FOR SALES DEMOS (Customize Per Client)

### Option A: Same Deployment, Change Branding in Vercel

Just update these environment variables in Vercel:
```
APP_COMPANY_NAME = Client's Business Name
APP_COMPANY_EMAIL = client@email.com
APP_COMPANY_PHONE = (555) 123-4567
APP_FROM_NAME = Client's Name
```

Redeploy → branded for client.

### Option B: Separate Deployment Per Client

1. Fork the repo for each client
2. Deploy to Vercel (new project)
3. Add their environment variables
4. Each client gets custom URL: `clientname-roof-manager.vercel.app`

---

## 📊 WHAT EACH SERVICE COSTS

- **Airtable Free:** 1,200 records (enough for ~200 customers)
- **Google Calendar:** Free (unlimited events)
- **Brevo Free:** 300 emails/day (enough for most small businesses)
- **Vercel Free:** Unlimited hobby projects
- **Total: $0/month** for you to use it
- **Total: $0/month** for small business clients

**Upsell path when clients grow:**
- Airtable Plus: $20/month (50,000 records)
- Brevo Lite: $25/month (10,000 emails)

**Your margin:** Charge $100-300/month, costs you $0-45/month. 💰

---

## 🚨 TROUBLESHOOTING

**Airtable script fails:**
- Check token has all 4 scopes
- Check "All bases" is selected
- Delete token and recreate

**Google Calendar not working:**
- Verify service account email is shared with calendar
- Check private key has `\n` characters (don't remove them!)
- Make sure Calendar API is enabled in Google Cloud Console

**Vercel deployment fails:**
- Check environment variables are added for Production
- Try redeploying from "Deployments" tab
- Check build logs for specific error

**Automation not triggering:**
- Check `AUTOMATION_ENABLED=true` in Vercel
- Check all API keys are pasted correctly (no extra spaces)
- Test locally first to isolate the issue

---

## ✅ FINAL CHECKLIST

Before going to sales calls:

- [ ] Local version works (test script passes)
- [ ] Created real job locally, saw it in Airtable
- [ ] Saw calendar event appear in Google Calendar
- [ ] Received confirmation email
- [ ] Vercel deployment shows "Ready"
- [ ] Production URL works: https://roof-king-manager.vercel.app/demo
- [ ] System status shows all green ✓
- [ ] Created test job in production, all 4 systems updated

**If all checked:** You're bulletproof. Go sell. 🚀

---

## 🎬 SALES DEMO SCRIPT (< 3 minutes)

**"Watch this."**

1. Open: https://roof-king-manager.vercel.app/demo
2. Show ROI metrics: "$78K/year saved, 25% revenue increase"
3. Show workflow diagram: "This is what happens when a customer requests service"
4. Click "Try It Now"
5. Fill out form (use their business name)
6. Add scheduled date
7. Click "Create Job"
8. **< 2 seconds later:**
   - "Check your Airtable" → data appears
   - "Check your calendar" → event appears
   - "Check your email" → confirmation arrives
9. **Close:** "This runs 24/7. No employees needed. Your competition is using spreadsheets. Questions?"

**Price:** $100-300/month (you keep 100% margin if free tier)

---

**Everything you need is in this file. No other docs needed.**
**Go make it work, then go make money.** 💰
