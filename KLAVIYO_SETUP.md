# Klaviyo Form Setup Instructions

Your Klaviyo form has been updated to use the modern Klaviyo API v3 with secure server-side handling.

## What Was Fixed

The form was using Klaviyo's deprecated legacy endpoint (`manage.kmail-lists.com/ajax/subscriptions/subscribe`) which is no longer reliable. It has been replaced with:

- **Modern Klaviyo API v3** for reliable submissions
- **Serverless function** to keep your API key secure
- **Proper error handling** and validation

## Setup Steps

### 1. Get Your Klaviyo Private API Key

1. Log in to your Klaviyo account
2. Go to **Settings** → **Account** → **API Keys**
3. Create a new **Private API Key** (or use an existing one)
4. Copy the key (it starts with `pk_`)

### 2. Configure Environment Variables

#### For Netlify (Recommended):

1. Go to your Netlify dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add these two variables:
   - `KLAVIYO_PRIVATE_KEY`: Your private API key (starts with `pk_`)
   - `KLAVIYO_LIST_ID`: `UcNgUr` (your existing list ID)

#### For Local Development:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your actual values:
   ```
   KLAVIYO_PRIVATE_KEY=pk_your_actual_key_here
   KLAVIYO_LIST_ID=UcNgUr
   ```

3. Install Netlify CLI for local testing:
   ```bash
   npm install -g netlify-cli
   ```

4. Run locally:
   ```bash
   netlify dev
   ```

### 3. Deploy to Netlify

If you haven't already:

1. Connect your GitHub repository to Netlify
2. Netlify will automatically detect the `netlify.toml` configuration
3. Add the environment variables in Netlify dashboard (step 2 above)
4. Deploy!

## Testing

### Test Locally:
```bash
netlify dev
```
Then visit `http://localhost:8888` and try submitting the form.

### Test in Production:
After deploying, submit a test email through your live site and verify it appears in your Klaviyo list.

## Files Changed

- ✅ `src/klaviyo-form.js` - Updated to use serverless function
- ✅ `netlify/functions/klaviyo-subscribe.js` - New serverless function
- ✅ `netlify.toml` - Netlify configuration
- ✅ `.env.example` - Environment variable template

## Security Notes

- ✅ Your private API key is now stored securely in environment variables
- ✅ The key is never exposed to the browser
- ✅ All API calls happen server-side through the Netlify function

## Troubleshooting

### Form shows success but no submissions in Klaviyo:
- Check that environment variables are set correctly in Netlify
- Verify your private API key is valid and starts with `pk_`
- Check Netlify function logs for errors

### "Server configuration error":
- Environment variables are missing or not set in Netlify

### "Failed to create profile" or "Failed to subscribe to list":
- Check that your API key has the correct permissions
- Verify the List ID is correct

## Support

If you encounter issues:
1. Check Netlify function logs in your Netlify dashboard
2. Verify environment variables are set correctly
3. Test with a fresh email address
