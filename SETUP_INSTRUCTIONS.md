# Roof King Manager - Setup Instructions

## Current Status

### ✅ COMPLETED:
- Next.js 14 project initialized with TypeScript + Tailwind
- Core library files:
  - `lib/types.ts` - All TypeScript interfaces
  - `lib/localStorageStore.ts` - localStorage persistence layer
  - `lib/pdf.ts` - PDF generation with pdf-lib
  - `lib/email.ts` - Brevo email integration
  - `lib/gemini.ts` - Google Gemini API integration
- API Routes:
  - `app/api/suggest-category/route.ts` - AI category suggestion
  - `app/api/send-receipt/route.ts` - PDF generation + email sending
- Dependencies installed: pdf-lib, uuid
- Environment configuration files created

### ⏳ TODO - Create these files locally:

#### Components (in `components/` directory):
1. `JobForm.tsx` - Form to create/edit jobs
2. `JobList.tsx` - Display list of all jobs
3. `ExtraChargeForm.tsx` - Form to add/edit extra charges
4. `ExtraChargesTable.tsx` - Table showing extra charges with selection
5. `GenerateReceiptModal.tsx` - Modal for receipt generation and email

#### Pages:
1. Update `app/layout.tsx` - Add header and styling
2. Update `app/page.tsx` - Redirect to /dashboard
3. Create `app/dashboard/page.tsx` - Main dashboard with job list
4. Create `app/jobs/new/page.tsx` - New job creation page
5. Create `app/jobs/[jobId]/page.tsx` - Job detail page with extra charges

## Quick Start

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env.local`
   - Fill in your API keys

3. **Create missing component and page files**:
   - Refer to the original specification document
   - All components should use the types from `lib/types.ts`
   - All components should use `localStorageStore` for data persistence

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial Roof King Manager setup"
   git push -u origin master
   ```

## File Reference

The complete file structure should be:
```
/app
  /api
    /suggest-category/route.ts ✅
    /send-receipt/route.ts ✅
  /dashboard/page.tsx ⏳
  /jobs
    /new/page.tsx ⏳
    /[jobId]/page.tsx ⏳
  layout.tsx ⏳
  page.tsx ⏳
  globals.css ✅
  favicon.ico ✅

/components
  JobForm.tsx ⏳
  JobList.tsx ⏳
  ExtraChargeForm.tsx ⏳
  ExtraChargesTable.tsx ⏳
  GenerateReceiptModal.tsx ⏳

/lib
  types.ts ✅
  localStorageStore.ts ✅
  pdf.ts ✅
  email.ts ✅
  gemini.ts ✅
```

## Component Implementation Guide

All components are client components ("use client" directive).

### JobForm.tsx
- Props: `onSubmit`, `onCancel`, optional `initialData`
- Uses `v4 as uuidv4` from 'uuid'
- Form fields: title*, customerName*, customerEmail*, customerPhone, siteAddress, initialEstimateAmount, notes
- Calls `onSubmit(job: Job)` with complete Job object

### JobList.tsx  
- Props: `jobs: Job[]`, `extraCharges: ExtraCharge[]`
- Calculates total extra charges per job
- Each job is a clickable Link to `/jobs/[jobId]`
- Shows: title, customer name, initial estimate, extra charges total, last updated

### ExtraChargeForm.tsx
- Props: `jobId`, `onSubmit`, `onCancel`, optional `initialData`
- Form fields: description*, category, amount*, taxAmount, approvedBy
- "Suggest Category" button calls `/api/suggest-category`
- Calls `onSubmit(charge: ExtraCharge)` with complete ExtraCharge object

### ExtraChargesTable.tsx
- Props: `charges`, `selectedIds`, `onSelectionChange`, optional `onEdit`, `onDelete`
- Checkbox selection (individual + select all)
- Shows: description, category, amount, created date
- Edit/Delete actions if handlers provided

### GenerateReceiptModal.tsx
- Props: `job`, `selectedCharges`, `onClose`
- Shows selected charges with total
- Editable customer email and office email fields
- "Generate & Send Receipt" button:
  - Calls `/api/send-receipt`
  - Downloads PDF on success
  - Shows success/warning toast based on emailSent flag

## Page Implementation Guide

### app/page.tsx
```tsx
import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/dashboard');
}
```

### app/layout.tsx
- Add header with app title
- Wrap children in max-width container
- Import globals.css

### app/dashboard/page.tsx
- Client component
- Load jobs and extra charges from localStorage on mount
- Render JobList component
- "New Job" button linking to /jobs/new

### app/jobs/new/page.tsx
- Client component
- Render JobForm
- On submit: save to localStorage via `localStorageStore.addJob`
- Navigate to `/jobs/[jobId]` after creation

### app/jobs/[jobId]/page.tsx  
- Client component
- Load job and charges from localStorage
- Show job details
- Render ExtraChargesTable
- "Add Extra Charge" button shows ExtraChargeForm
- "Generate Receipt" button (when charges selected) shows GenerateReceiptModal

## Testing Checklist

- [ ] Can create a new job
- [ ] Can add extra charges to a job
- [ ] AI category suggestion works (requires GEMINI_API_KEY)
- [ ] Can generate PDF receipt (downloads in browser)
- [ ] Can send receipt via email (requires BREVO_API_KEY)
- [ ] Data persists in localStorage across page refreshes

## Environment Variables Required

```env
BREVO_API_KEY=xkeysib-...
GEMINI_API_KEY=AIza...
APP_FROM_EMAIL=sharthok.pal@gmail.com
APP_FROM_NAME=Paradime Productions
APP_COMPANY_NAME=Roof King Roofing & Solar
APP_COMPANY_EMAIL=office@sandiegoroofking.com
APP_COMPANY_PHONE=(760) 941-5464
APP_COMPANY_ADDRESS=San Diego, CA
APP_DEFAULT_TAX_RATE=0.00
NEXT_PUBLIC_APP_COMPANY_EMAIL=office@sandiegoroofking.com
```

## Next Steps

1. Create all missing component and page files following the guides above
2. Test locally with `npm run dev`
3. Push to GitHub
4. Deploy to Vercel with environment variables configured

