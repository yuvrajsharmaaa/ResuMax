# 🔒 SSL Certificate Workaround for Local Development

## Issue
The external Puter.js library (https://js.puter.com/v2/) has an SSL certificate that may not be trusted by your browser, causing a `net::ERR_CERT_AUTHORITY_INVALID` error.

## Solutions

### Option 1: Chrome/Chromium with SSL Bypass (Recommended for Dev)

**Close all Chrome windows first**, then launch:

```bash
google-chrome --ignore-certificate-errors --ignore-urlfetcher-cert-requests --unsafely-treat-insecure-origin-as-secure=https://js.puter.com http://localhost:5173
```

Or for Chromium:
```bash
chromium --ignore-certificate-errors http://localhost:5173
```

### Option 2: Update System Certificates (Arch Linux)

```bash
# Update certificate store
sudo trust extract-compat

# Reboot system (or restart browser)
```

### Option 3: Try Different Browser

Firefox may handle the certificate better:
```bash
firefox http://localhost:5173
```

Then in Firefox:
1. Go to `about:config`
2. Set `security.enterprise_roots.enabled` to `true`
3. Restart Firefox

### Option 4: Network-Level Solutions

- **Disable VPN/Proxy** if you're using one
- **Check antivirus settings** - some block external scripts
- **Try different network** (mobile hotspot, different WiFi)

## Verification

Once the page loads, check browser console:
- ✅ Should see: `"✅ Puter.js loaded successfully"`
- ✅ Should see: `"✅ Puter initialized successfully"`
- ❌ If you see SSL errors, try another solution above

## Production Deployment

This SSL issue **only affects local development**. The Vercel production deployment at:
https://ai-resume-analyzer-main-nov25ejh5-yuvrajsharmaaas-projects.vercel.app

Should work fine since Vercel's infrastructure handles certificates correctly.

## Alternative: Use Different AI Service

If Puter.js continues to have issues, consider:
- OpenAI API
- Anthropic Claude API
- Local AI (Ollama)
