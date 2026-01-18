# Google Tag Manager, GA4, and Microsoft Clarity Setup Guide

## Overview

This site uses Google Tag Manager (GTM) to manage all analytics tags, including:
- Google Analytics 4 (GA4)
- Microsoft Clarity

## Environment Variables

Add to your `.env.local` file:

```bash
# Google Tag Manager Container ID
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

**Note:** The GTM ID format is `GTM-XXXXXXX` (not `G-XXXX` which is for direct GA4).

## GTM Container Setup

### Step 1: Create GTM Container

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Create a new container or use existing one
3. Copy your Container ID (format: `GTM-XXXXXXX`)

### Step 2: Add Google Analytics 4 Tag

1. In GTM, go to **Tags** → **New**
2. Tag Configuration:
   - Choose **Google Analytics: GA4 Configuration**
   - Measurement ID: Your GA4 ID (format: `G-XXXXXXX`)
   - Get this from [Google Analytics](https://analytics.google.com/)
3. Triggering:
   - Choose **All Pages**
4. Save and name it "GA4 Configuration"

### Step 3: Add Microsoft Clarity Tag

1. In GTM, go to **Tags** → **New**
2. Tag Configuration:
   - Choose **Custom HTML**
   - Paste the Clarity script:
   ```html
   <script type="text/javascript">
   (function(c,l,a,r,i,t,y){
       c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
       t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
       y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
   })(window, document, "clarity", "script", "YOUR_CLARITY_PROJECT_ID");
   </script>
   ```
   - Replace `YOUR_CLARITY_PROJECT_ID` with your actual Clarity Project ID
3. Triggering:
   - Choose **All Pages**
4. Save and name it "Microsoft Clarity"

### Step 4: Configure Page View Tracking

The site automatically pushes page views to GTM's dataLayer on route changes. GTM will receive:
- `event: 'page_view'`
- `page_path: '/current-path'`
- `page_title: 'Page Title'`

To track these in GA4:
1. Create a new tag: **Google Analytics: GA4 Event**
2. Event Name: `page_view`
3. Configuration Tag: Select your GA4 Configuration tag
4. Trigger: Create a Custom Event trigger for `page_view` event

### Step 5: Publish Container

1. Click **Submit** in GTM
2. Add version name and description
3. Click **Publish**

## Verification

### Test GTM Installation

1. Install [Google Tag Assistant](https://tagassistant.google.com/)
2. Visit your site
3. Check that GTM container loads
4. Verify GA4 and Clarity tags fire

### Test GA4

1. Go to GA4 → **Reports** → **Realtime**
2. Visit your site
3. You should see your visit appear within seconds

### Test Clarity

1. Go to [Microsoft Clarity Dashboard](https://clarity.microsoft.com/)
2. Visit your site
3. Wait a few minutes, then check the dashboard for session data

## Benefits of Using GTM

✅ **Centralized Management**: All tags in one place  
✅ **No Code Changes**: Add/remove tags without deploying  
✅ **Version Control**: Track changes to your tag configuration  
✅ **Preview Mode**: Test tags before publishing  
✅ **Easy Debugging**: Use GTM's debug mode  

## Route Change Tracking

The site automatically tracks route changes in Next.js App Router. Each navigation pushes a `page_view` event to the dataLayer, which GTM can use to track page views in GA4.

## Additional Tags

You can easily add more tags through GTM:
- Facebook Pixel
- LinkedIn Insight Tag
- Other marketing pixels
- Custom event tracking

Just add them in GTM - no code changes needed!
