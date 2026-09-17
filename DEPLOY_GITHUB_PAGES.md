# Deployment Guide: Free Permanent Web Link (GitHub Pages & Netlify)

This guide provides step-by-step instructions for **Alwinson Bustamante** to publish the **Human BI Dashboard & QuakeSpots GIS Portal** online for **Ma'am Mary Jane Legaspi** and the public (**1B, 3-yes**).

---

## Option 1: Netlify (Fastest - 30 Seconds, No Terminal Needed)

1. Open [Netlify Drop](https://app.netlify.com/drop) in your web browser.
2. Sign in or create a free account.
3. Drag and drop the entire folder: `C:\xampp\htdocs\client` into the upload box on Netlify.
4. Netlify will instantly deploy it and give you a live HTTPS link (e.g. `https://mary-jane-bi-portal.netlify.app`).
5. Send this link to Ma'am Jane! It works immediately on iPhone, Android, tablets, and laptops.

---

## Option 2: GitHub Pages (Permanent & Recommended)

### Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Set **Repository name**: `quakespots-human-bi` (or any name you prefer).
3. Set visibility to **Public** (required for free GitHub Pages).
4. Do **not** check "Add a README file" (we already have one).
5. Click **Create repository**.

### Step 2: Push Your Code
Open PowerShell or Command Prompt in `C:\xampp\htdocs\client` and run:

```bash
cd C:\xampp\htdocs\client
git init
git add .
git commit -m "Feat: Deploy Human BI Dashboard and QuakeSpots GIS Portal"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/quakespots-human-bi.git
git push -u origin main
```

*(Note: `quakespots3.html` is ~83MB, which is well within GitHub's 100MB per-file upload limit).*

### Step 3: Activate GitHub Pages
1. On your GitHub repository page, click on **Settings** (top navigation tab).
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment > Branch**:
   - Source: `Deploy from a branch`
   - Branch: `main` / `/(root)`
4. Click **Save**.
5. Within 1 to 2 minutes, GitHub will display your live URL:
   `https://YOUR_GITHUB_USERNAME.github.io/quakespots-human-bi/`

---

## Option 3: Google Drive Backup
To back up the files to Google Drive as promised to Ma'am:
1. Compress the folder `C:\xampp\htdocs\client` into a `.zip` file (`Human_BI_and_QuakeSpots_Backup.zip`).
2. Upload this `.zip` file to your Google Drive folder.
3. Share the Drive link with Ma'am Jane as a backup.

---

## How Ma'am Jane Can Update Data Rapidly ("Sana pag may update mabilis din")

### Method A: Live In-Browser (Instant)
1. Ma'am opens the web link on her phone or computer.
2. She clicks **"✏️ Quick Edit Data"** in the top navigation bar.
3. She edits any KPI number, percentage, or trend metric.
4. She clicks **"Apply Live Changes"** — the charts and cards update instantly on screen and save to her browser's LocalStorage!
5. She can also click **"Backup JSON"** to save her custom figures.

### Method B: Direct GitHub Edit (Permanent for All Viewers)
1. Go to your GitHub repository.
2. Open `data/dashboard-data.json`.
3. Click the pencil icon (**Edit this file**).
4. Update the numbers in the JSON.
5. Click **Commit changes**. GitHub Pages will automatically refresh with the new figures in ~60 seconds!
