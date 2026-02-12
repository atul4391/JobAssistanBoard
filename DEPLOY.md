# Deploy to Vercel

## Option 1: One-Click Deploy (Easiest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/atul4391/JobAssistanBoard&framework=vite)

Click the button above and follow the steps.

## Option 2: GitHub Actions Auto-Deploy

### Step 1: Get Vercel Credentials

Run these commands in your terminal (where you have Vercel CLI installed):

```bash
# Login to Vercel
vercel login

# Link project (if not already linked)
vercel link

# Get credentials
vercel env ls
```

Or get them from Vercel Dashboard:
- Go to https://vercel.com/dashboard
- Click your project → Settings → General
- Copy: `Project ID` and `Organization ID`

### Step 2: Add GitHub Secrets

1. Go to: https://github.com/atul4391/JobAssistanBoard/settings/secrets/actions
2. Add these secrets:
   - `VERCEL_TOKEN` - Get from: https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` - From Project Settings
   - `VERCEL_PROJECT_ID` - From Project Settings

### Step 3: Push to Deploy

```bash
git push origin main
```

GitHub Actions will automatically deploy!

## Option 3: Manual CLI Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## After Deployment: Setup KV Database

1. Go to: https://vercel.com/dashboard
2. Click **Storage** → **Create Database** → **KV**
3. Connect to your project
4. Done! Data will persist.
