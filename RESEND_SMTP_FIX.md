# Resend SMTP Configuration Fix Guide

## Problem
"Error sending confirmation email" when signing up

## Root Cause
The Resend SMTP credentials were not properly configured or the sender email was not verified in Resend.

## Solution - Step by Step

### Step 1: Verify Sender Email in Resend Dashboard
1. Go to [Resend Dashboard](https://dashboard.resend.com)
2. Click **Domains** in the left sidebar
3. You should see your domain listed
4. Make sure the status shows **✓ Verified**
5. If not verified, click on the domain and follow the DNS verification steps

### Step 2: Get SMTP Credentials from Resend
1. In Resend Dashboard, go to **Settings** → **API Tokens**
2. Look for your SMTP credentials or create a new token if needed
3. Copy these values:
   - **SMTP Host:** smtp.resend.com
   - **SMTP Port:** 587
   - **SMTP Username:** resend (or your email)
   - **SMTP Password:** [Your Resend API Key - starts with "re_"]

### Step 3: Update Supabase SMTP Settings
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **supabase-emerald-queen**
3. Click **Authentication** → **Email Templates** (in left sidebar)
4. Scroll down to **Custom SMTP Settings**
5. Click **Enable Custom SMTP**
6. Fill in ALL fields:
   - **SMTP Host:** smtp.resend.com
   - **SMTP Port:** 587
   - **SMTP User:** resend
   - **SMTP Password:** [Your Resend API Key - the long string starting with "re_"]
   - **Sender Email:** [Your Resend verified email - e.g., onboarding@example.com]
   - **Sender Name:** Stärke Inventory
7. Click **Save**

### Step 4: Test the Configuration
1. Go back to your app
2. Try signing up with a new email address
3. You should receive the confirmation email immediately

### Common Issues & Solutions

#### Issue: "SMTP authentication failed"
- **Solution:** Check that your SMTP Password is correct (copy it again from Resend)
- Make sure you're using your full Resend API key, not just part of it

#### Issue: "Email address not authorized"
- **Solution:** Verify your sender email domain in Resend dashboard
- Only use email addresses from your verified domain in Resend

#### Issue: "Connection timeout"
- **Solution:** Double-check the SMTP Host (should be exactly: smtp.resend.com)
- Verify the port is 587

#### Issue: Still getting "Error sending confirmation email"
- **Solution:** Check Resend dashboard for any quota or rate limit messages
- Verify that your Supabase settings were actually saved (refresh and check again)

### Verification Checklist
- [ ] Resend domain is verified in Resend dashboard
- [ ] SMTP Host is: **smtp.resend.com**
- [ ] SMTP Port is: **587**
- [ ] SMTP User is: **resend**
- [ ] SMTP Password is your full Resend API key (starts with "re_")
- [ ] Sender Email is a verified email from your Resend domain
- [ ] Settings are saved in Supabase (page was refreshed after saving)
- [ ] Test signup with new email address

Once you complete these steps, email confirmation should work immediately!
