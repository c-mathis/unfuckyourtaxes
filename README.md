# "Are Your Taxes Fucked?" Landing Page

Tax resolution and preparation landing page for billboard/outdoor advertising campaigns.

## 📁 Files

- **index.html** - Main HTML structure
- **style.css** - All styles and design (same as unfuckyourweb)
- **script.js** - Form handling with conditional logic

## 🎯 Purpose

This page is designed to capture leads for:
- Tax resolution (IRS debt, liens, levies, wage garnishments)
- Tax preparation (unfiled returns, quarterly estimates)
- Tax planning (business structure, deductions, compliance)

## 🔄 Differences from Unfuck Your Web

**Same:**
- Design, typography, layout
- Overall tone and structure
- Mobile-first approach

**Different:**
- 32 real tax problems (not comedic)
- Different CTA copy focused on urgency
- Enhanced form with tax-specific fields:
  - Phone number (required for tax leads)
  - Type of tax problem (dropdown)
  - Estimated tax amount owed (conditional field)

## 📋 Form Logic

The **"Estimated Tax Amount Owed"** field appears conditionally when the user selects:
- Tax Debt / Back Taxes Owed
- Wage Garnishment
- Bank Levy
- Tax Lien
- Payroll Tax Issues

For other problem types (Unfiled Returns, Tax Planning, etc.), the field is hidden.

## 🎨 Customization

Same as the main Unfuck Your Web page - edit CSS variables at the top of `style.css`:

```css
:root {
    --color-bg: #000000;           /* Background */
    --color-text: #ffffff;         /* Text color */
    --color-accent: #FF0000;       /* Buttons */
    --font-main: 'DM Sans', sans-serif;
}
```

## 📧 Form Setup

1. Open `script.js`
2. Line 11, update the form endpoint:

```javascript
formEndpoint: 'https://formsubmit.co/your@email.com', // CHANGE THIS
```

## 🚀 Deployment

This can be deployed:
- As a subdirectory: `unfuckyourweb.com/taxes`
- As a separate domain: `unfuckyourtaxes.com`
- Copy these 3 files to your hosting/Cloudflare Pages

## 💡 Lead Quality Notes

The conditional "amount owed" field helps qualify leads:
- **Under $10k**: Typically DIY or low-tier service
- **$10k-$50k**: Sweet spot for tax resolution
- **$50k+**: High-value leads, likely need attorney involvement

The "Type of Tax Problem" helps route leads to the right service:
- **Unfiled/Planning** → Tax prep/CPA
- **Debt/Liens/Levies** → Tax resolution specialist
- **Audit** → Representation/attorney

## 📊 Tracking

Same UTM capture as the main site. URL parameters automatically tracked:
- `utm_source`, `utm_medium`, `utm_campaign`
- Billboard placement codes
- Landing page and referrer

## 🎭 Tone Guide

**Keep it sophisticated irreverent:**
- Direct and honest about the problem
- No sugarcoating ("The IRS doesn't forget")
- Professional help, not judgment
- Urgency without fear-mongering
- One joke allowed (the dog dependent one)

## 🔧 Technical Notes

- No animations (instant load)
- Mobile-first design
- Works without JavaScript (form won't conditionally show field, but still submits)
- Select dropdowns styled to match inputs
- Accessible keyboard navigation
