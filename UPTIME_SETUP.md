# Keep-Alive Setup Guide

Your app now has a built-in keep-alive system that pings itself every 5 minutes. To ensure 24/7 uptime even when your laptop is off, you should also set up external monitoring services.

## ✅ What's Already Working

Your app now includes:
- **`/health` endpoint** - Returns server status and uptime
- **Self-ping service** - Automatically pings `/health` every 5 minutes
- **Automatic startup** - Keep-alive starts when server starts

## 🔄 How It Works

1. When your server starts, it sets up a timer to ping itself every 5 minutes
2. This keeps the Node.js process active and prevents Replit from sleeping
3. External services (like UptimeRobot) provide backup monitoring from outside

## 🚀 Setting Up UptimeRobot (Recommended)

**UptimeRobot** is the most popular free uptime monitoring service.

### Step 1: Create Account
1. Go to https://uptimerobot.com
2. Click **"Sign Up Free"**
3. Create your account (no credit card needed)
4. Verify your email

### Step 2: Add Your Monitor
1. Click **"+ Add New Monitor"** in your dashboard
2. Fill in the details:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Tivideo App (or your app name)
   - **URL**: `https://your-replit-url.repl.co/health`
     - Get your URL from Replit's webview pane
     - Make sure to add `/health` at the end
   - **Monitoring Interval**: 5 minutes (free tier)
3. Click **"Create Monitor"**

### Step 3: Verify It's Working
1. Wait a few minutes
2. Check your UptimeRobot dashboard
3. You should see your monitor showing as "Up"
4. Click on it to view response times and uptime percentage

### Step 4: Set Up Alerts (Optional)
1. Go to **"My Settings"** → **"Alert Contacts"**
2. Add your email or phone number
3. UptimeRobot will notify you if your app goes down

## 📊 Alternative Monitoring Services

### Option 2: Cron-job.org

1. Go to https://cron-job.org/en/
2. Sign up for a free account
3. Create a new cron job:
   - **Title**: Tivideo Keep-Alive
   - **URL**: `https://your-replit-url.repl.co/health`
   - **Schedule**: Every 5 minutes
4. Save and activate

### Option 3: BetterUptime

1. Go to https://betteruptime.com
2. Sign up (free tier available)
3. Create a new monitor:
   - **URL**: `https://your-replit-url.repl.co/health`
   - **Check frequency**: 5 minutes
4. Configure alerts if desired

### Option 4: Freshping by Freshworks

1. Go to https://www.freshworks.com/website-monitoring/
2. Sign up for free
3. Add your health endpoint URL
4. Set check interval to 1 or 5 minutes

## 🔍 Monitoring Your Keep-Alive System

### Check Server Logs
Your Replit console will show keep-alive pings:
```
✅ Keep-alive ping successful - uptime: 300s
```

If you see warnings:
```
⚠️ Keep-alive ping failed: ...
```
This means the self-ping didn't work (usually not a problem if external monitoring is working).

### Test the Health Endpoint
Visit `https://your-replit-url.repl.co/health` in your browser.

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

## 💡 Best Practices

### Use Multiple Services
For maximum reliability, use both:
- **Internal**: Self-ping (already set up)
- **External**: UptimeRobot or similar service

### Monitor Your Credits
If using Replit's free tier, be aware:
- Your app will still sleep if you run out of compute credits
- Monitor your usage in Replit dashboard

### Set Up Alerts
Configure email/SMS alerts in UptimeRobot so you know immediately if your app goes down.

### Check Regularly
- Review uptime stats weekly
- Investigate any downtime incidents
- Ensure your monitoring service is still active

## 🐛 Troubleshooting

### Problem: UptimeRobot shows "Down"

**Possible causes:**
1. Your Replit server stopped
2. You ran out of Replit credits
3. Your health endpoint URL is incorrect

**Solutions:**
- Check if your Replit workflow is running
- Verify the URL includes `/health`
- Test the URL in your browser
- Check Replit console for errors

### Problem: Self-ping logs not appearing

**This is usually normal** - the logs might be hidden. As long as:
- The server is running
- External monitoring shows "Up"
- Your app is accessible

Everything is working fine!

### Problem: App still goes to sleep

**If using Replit free tier:**
- Replit may still enforce sleep policies
- Consider upgrading to a paid plan
- Or deploy to Railway/Render for true 24/7 uptime

**If the app is busy processing:**
- Video rendering can consume resources
- The self-ping will keep the server alive between renders

## 📈 What to Expect

With the keep-alive system active:

✅ **Server stays awake** during idle periods
✅ **Automatic recovery** if a ping fails
✅ **Monitoring alerts** if the app goes down
✅ **Uptime statistics** from UptimeRobot
✅ **24/7 availability** (subject to Replit policies)

## 🎯 Next Steps

1. ✅ Keep-alive code is installed (already done)
2. ✅ Server is running with self-ping active
3. 📋 Set up UptimeRobot (do this now!)
4. 📧 Configure email alerts
5. 📊 Monitor your uptime dashboard

---

## Quick Reference

**Your Health Endpoint:**
```
https://your-replit-url.repl.co/health
```

**Ping Frequency:**
- Internal: Every 5 minutes
- External (UptimeRobot): Every 5 minutes

**Expected Behavior:**
- Server pings itself internally
- UptimeRobot pings from external network
- Both should show successful responses
- Your app stays awake 24/7

**Need Help?**
Check your Replit console logs for keep-alive status messages.
