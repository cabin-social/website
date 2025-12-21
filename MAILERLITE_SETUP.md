# MailerLite Form Setup Instructions

Your waitlist form has been updated to use MailerLite API with secure server-side handling.

## What Changed

The form was migrated from Klaviyo to MailerLite with:

- **MailerLite API** for reliable email subscriptions
- **Serverless function** to keep your API key secure
- **Same user experience** with success banners and error handling

## Setup Instructions

### 1. Get Your MailerLite API Key

1. Log in to your MailerLite account at [https://dashboard.mailerlite.com](https://dashboard.mailerlite.com)
2. Go to **Integrations** → **Developer API**
3. Click **Generate new token**
4. Copy your API key (it will look like a long string)

### 2. Get Your Group ID

1. In MailerLite, go to **Subscribers** → **Groups**
2. Select the group you want to add subscribers to (or create a new one)
3. The Group ID will be visible in the URL or group settings
4. Copy the Group ID

### 3. Set Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add these two variables:
   - `MAILERLITE_API_KEY`: Your API key from step 1
   - `MAILERLITE_GROUP_ID`: Your Group ID from step 2

   Example:
   ```
   MAILERLITE_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
   MAILERLITE_GROUP_ID=123456789
   ```

5. Click **Save**

### 4. Deploy Your Site

After setting the environment variables, deploy your site:

```bash
git add .
git commit -m "Migrated to MailerLite"
git push
```

Netlify will automatically redeploy with the new configuration.

## Testing

### Test Locally (Optional):

1. Update your local `.env` file with your actual credentials
2. Run your development server
3. Test the form submission

### Test in Production:

After deploying, submit a test email through your live site and verify it appears in your MailerLite group.

## Files Updated

- ✅ `src/mailerlite-form.js` - Frontend form handler
- ✅ `netlify/functions/mailerlite-subscribe.js` - Serverless function
- ✅ `src/index.html` - Updated script reference
- ✅ `.env.example` - Updated environment variable template

## Troubleshooting

### Form shows error message:
- Check that environment variables are set correctly in Netlify
- Verify your API key is valid and has the correct permissions
- Check the Netlify function logs for detailed error messages

### Form shows success but no submissions in MailerLite:
- Verify the Group ID is correct
- Check that the group exists and is active in MailerLite
- Look at the MailerLite activity log for the subscriber

### API Key Issues:
- Make sure you're using the API key from the Developer API section
- Ensure the key hasn't expired or been revoked
- Try generating a new API key if issues persist

## Support

For MailerLite API documentation, visit:
https://developers.mailerlite.com/docs/
