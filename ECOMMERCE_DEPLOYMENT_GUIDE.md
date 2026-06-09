# Ultimate E-Commerce Deployment Guide

This guide outlines the perfect, modern, and SEO-friendly deployment strategy for a new Next.js E-Commerce website, exactly like the setup we just completed for Steav News.

## Tech Stack Overview
* **Registrar**: Namecheap (Where you buy the name)
* **DNS Manager**: Cloudflare (For speed, security, and DNS control)
* **Hosting**: Vercel (Where your Next.js code lives)

---

## Step 1: Buy the Domain (Namecheap)
1. Go to Namecheap and buy your new e-commerce domain (e.g., `myshop.com`).
2. Leave the settings alone for a moment while we set up Cloudflare.

## Step 2: Connect to Cloudflare (The DNS Manager)
1. Go to [Cloudflare.com](https://dash.cloudflare.com) and click **Add a Site**.
2. Type in your new domain (`myshop.com`) and select the **Free Plan**.
3. Cloudflare will scan for existing records. Click Continue.
4. Cloudflare will give you **Two Custom Nameservers** (they look like `margot.ns.cloudflare.com`).
5. **Go back to Namecheap:**
   * Find your domain and click **Manage**.
   * Scroll to the **Nameservers** section.
   * Change "Namecheap BasicDNS" to **Custom DNS**.
   * Paste the two Cloudflare nameservers and click the green checkmark to save.

> [!TIP]
> From this point on, you never need to touch the Namecheap dashboard again. All DNS changes happen in Cloudflare.

---

## Step 3: Deploy your Code (Vercel)
1. Push your Next.js e-commerce code to a GitHub repository.
2. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository and click **Deploy**.

## Step 4: Link Your Domain (Vercel)
Once the deployment finishes:
1. In Vercel, go to the project **Settings** -> **Domains**.
2. Type your clean domain (`myshop.com`) into the box and click **Add**.
3. Select **No Redirect** and hit Add.
4. Now, find `www.myshop.com` in your Vercel list (or add it if it's missing).
5. Click **Edit** next to `www.myshop.com`.
6. Set "Redirect to" to `myshop.com` with a **308 Permanent Redirect**.

> [!IMPORTANT]
> Redirecting `www` to your bare domain is critical for SEO so Google doesn't think you have two duplicate websites.

---

## Step 5: Configure the DNS (Cloudflare)
Vercel will give you a specific target for your domain (usually a CNAME like `cname.vercel-dns.com` or a dedicated string).

1. Go back to your **Cloudflare Dashboard** -> **DNS** -> **Records**.
2. Click **Add Record** and configure it for the clean domain:
   * **Type**: `CNAME`
   * **Name**: `@`
   * **Target**: Paste the target Vercel gave you (e.g., `ddf45ff...vercel.com`).
   * **Proxy Status**: **GREY / DNS Only** (Turn the orange cloud off!).
3. Click **Save**. 
4. Check Vercel after 60 seconds—it should show a green checkmark!

---

## Step 6: SEO Checklist (Getting to the top of Google)

To ensure customers can find your store, add these to your Next.js project:

1. **Auto-Redirect `www` in Code**: Ensure `next.config.js` or `middleware.ts` automatically redirects `www` traffic to your clean domain.
2. **Dynamic Sitemap**: Create a `sitemap.ts` in your `src/app` directory that automatically lists all your products.
3. **Robots.txt**: Add a `robots.ts` to allow Google's bots to crawl your store.
4. **Google Search Console**: 
   * Add your clean domain (`https://myshop.com`) to Google Search Console.
   * Verify it using the HTML Tag method (paste the tag into your `src/app/layout.tsx` file).
   * Submit your `sitemap.xml` URL to Google so it indexes all your products immediately.
