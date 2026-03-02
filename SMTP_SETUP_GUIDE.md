# Setting Up Custom SMTP for Email Delivery

## Problem
You're experiencing "Email rate limit reached" errors because Supabase's default SMTP server has strict rate limits and is only meant for development.

## Solution: Configure Custom SMTP Server

### Option 1: Gmail (Free)

#### Step 1: Enable 2FA on Gmail
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Scroll to "How you sign in to Google"
3. Click "2-Step Verification" and follow the steps

#### Step 2: Generate App Password
1. Go back to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Scroll to "App passwords" (only visible if 2FA is enabled)
3. Select Device: "Windows Computer" and App: "Mail"
4. Google will generate a 16-character password
5. **Copy this password** (you won't see it again)

#### Step 3: Configure Supabase SMTP
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `v0-inventory-management-system`
3. Click **Authentication** in the left sidebar
4. Click **Email Templates**
5. Look for **SMTP Settings** at the top
6. Click **Enable Custom SMTP**
7. Fill in:
   - **Host:** smtp.gmail.com
   - **Port:** 587
   - **Username:** your-email@gmail.com
   - **Password:** (16-character app password from Step 2)
   - **Sender Email:** your-email@gmail.com
   - **Sender Name:** Stärke Inventory

8. Click **Save**

### Option 2: Resend (Recommended - Even Easier)

#### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your email
4. Go to API Keys and copy your API key

#### Step 2: Configure Supabase SMTP
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **Authentication** → **Email Templates**
4. Click **Enable Custom SMTP**
5. Fill in:
   - **Host:** smtp.resend.com
   - **Port:** 465
   - **Username:** default
   - **Password:** (your Resend API key)
   - **Sender Email:** onboarding@resend.dev (or your verified domain)
   - **Sender Name:** Stärke Inventory

6. Click **Save**

## Testing Your Setup

After configuring SMTP:
1. Go back to your app
2. Try signing up with a new email address
3. You should receive the confirmation email without rate limit errors

## Benefits of Custom SMTP

✅ No more rate limit errors
✅ Professional email branding
✅ Reliable email delivery
✅ Free tier available (Gmail or Resend)
✅ Works for production

## Troubleshooting

**"Email not authorized" error:**
- This means you're still sending to addresses not in your team
- Check that all test emails are pre-authorized in Supabase

**"SMTP connection failed":**
- Double-check hostname and port
- Gmail: smtp.gmail.com:587
- Resend: smtp.resend.com:465

**Still getting rate limits:**
- Clear your browser cache
- Wait 5 minutes for changes to take effect
- Test with a brand new email address

## Need Help?

- [Supabase SMTP Guide](https://supabase.com/docs/guides/auth/auth-smtp)
- [Gmail App Passwords Help](https://support.google.com/accounts/answer/185833)
- [Resend Documentation](https://resend.com/docs)
