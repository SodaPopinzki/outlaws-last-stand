# Outlaw's Last Stand - Deployment Guide

Complete guide for deploying to GitHub and GitHub Pages.

---

## 📦 Repository Summary

**Total Files:** 56 created/modified
**Total Lines:** ~24,870 lines of code
**Version:** 1.0.0

### Major Components Created:
- ✅ 8 playable characters with unique abilities
- ✅ 15 base weapons + 7 legendary evolutions
- ✅ 12 enemy types + 10 boss encounters
- ✅ Complete UI system (Menu, HUD, Pause, Game Over)
- ✅ Meta progression and achievement system
- ✅ Audio and music systems (Web Audio API)
- ✅ Performance optimization (object pooling, LOD)
- ✅ Save/load system with import/export
- ✅ Comprehensive documentation

---

## 🚀 Step 1: Push to GitHub

### Prerequisites
- GitHub account created
- Git installed on your system
- Repository created on GitHub (recommended name: `outlaws-last-stand`)

### Commands to Run

**1. Verify you're on main branch:**
```bash
git branch
# Should show: * main
```

**2. Add your GitHub remote:**

```bash
git remote remove origin
git remote add origin https://github.com/SodaPopinzki/outlaws-last-stand.git
```

**3. Verify remote:**
```bash
git remote -v
# Should show your GitHub repository URL
```

**4. Push to GitHub:**
```bash
git push -u origin main
```

You may be prompted for GitHub credentials. Use a **Personal Access Token** instead of password:
- Go to GitHub Settings → Developer settings → Personal access tokens
- Generate new token with `repo` scope
- Use token as password when prompted

**5. Verify on GitHub:**
- Visit `https://github.com/SodaPopinzki/outlaws-last-stand`
- You should see all your files

---

## 🌐 Step 2: Set Up GitHub Pages

### Method 1: Using GitHub Actions (Recommended for Vite)

**1. Create GitHub Actions workflow:**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**2. Update vite.config.js for GitHub Pages:**

Add base path to `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/outlaws-last-stand/', // Add this line (match your repo name)
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

**3. Commit and push workflow:**

```bash
git add .github/workflows/deploy.yml vite.config.js
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

**4. Enable GitHub Pages:**
- Go to your repository on GitHub
- Click **Settings**
- Navigate to **Pages** (in left sidebar)
- Under **Source**, select **GitHub Actions**
- Click **Save**

**5. Wait for deployment:**
- Go to **Actions** tab in your repository
- Watch the deployment workflow run
- When complete (green checkmark), your site is live!

**6. Visit your game:**
```
https://SodaPopinzki.github.io/outlaws-last-stand/
```

### Method 2: Manual Build (Alternative)

If you prefer manual deployment:

**1. Build the project:**
```bash
npm run build
```

**2. Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

**3. Add deploy script to package.json:**
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

**4. Deploy:**
```bash
npm run deploy
```

**5. Configure GitHub Pages:**
- Go to Settings → Pages
- Set source to `gh-pages` branch
- Click Save

---

## ✅ Step 3: Verify Deployment

### Testing Checklist

Visit your deployed site and test:

**Basic Functionality:**
- [ ] Main menu loads
- [ ] Can navigate to character select
- [ ] Can select a character
- [ ] Game starts and runs smoothly
- [ ] Controls work (WASD, mouse)
- [ ] Can pause game (ESC)
- [ ] Can level up and select upgrades
- [ ] Game over screen appears on death

**Visual & Audio:**
- [ ] All fonts load correctly (Rye, Georgia)
- [ ] Images and sprites display
- [ ] Animations play smoothly
- [ ] Music plays (check browser autoplay policy)
- [ ] Sound effects work
- [ ] No console errors

**Save System:**
- [ ] Settings save and persist
- [ ] Meta progression saves between sessions
- [ ] LocalStorage works in production
- [ ] Can export/import saves

**Performance:**
- [ ] Maintains 60 FPS
- [ ] No lag during boss fights
- [ ] Particles don't cause slowdown
- [ ] Game is playable on target browsers

**Cross-Browser Testing:**
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if accessible)
- [ ] Mobile browsers (if applicable)

---

## 🐛 Common Issues & Solutions

### Issue: Fonts not loading
**Solution:** Ensure Google Fonts import is in index.html or CSS:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Rye&display=swap" rel="stylesheet">
```

### Issue: 404 errors on page refresh
**Solution:** This is expected with client-side routing. GitHub Pages serves the index.html for all routes.

### Issue: LocalStorage not working
**Solution:** Check browser privacy settings. LocalStorage is disabled in some private browsing modes.

### Issue: Music doesn't play automatically
**Solution:** Browser autoplay policies require user interaction. Music will start after first click/keypress.

### Issue: Base path errors (assets not loading)
**Solution:** Verify `base` in vite.config.js matches your repository name.

### Issue: Build fails in GitHub Actions
**Solution:** Check the Actions logs. Common issues:
- Missing dependencies (run `npm install` locally and commit package-lock.json)
- Build errors (run `npm run build` locally to test)
- Node version mismatch (workflow uses Node 20)

---

## 📊 Analytics (Optional)

### Add Google Analytics

**1. Get tracking ID from Google Analytics**

**2. Add to index.html:**
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🎉 Post-Deployment

### Promote Your Game

**1. Update README.md with live link:**
```markdown
# Outlaw's Last Stand

🎮 **[Play Now](https://SodaPopinzki.github.io/outlaws-last-stand/)**

A western-themed survivor-like game built with React!
```

**2. Add topics to repository:**
- game
- javascript
- react
- vite
- western
- survivor
- roguelike

**3. Create a release:**
- Go to Releases → Create new release
- Tag: v1.0.0
- Title: Outlaw's Last Stand v1.0.0
- Description: Initial release with all features

**4. Share on social media:**
- Twitter/X: Share with #gamedev #indiedev #webgame
- Reddit: r/WebGames, r/IndieGaming
- Discord: GameDev servers
- itch.io: Consider uploading there too

---

## 🔄 Continuous Deployment

Once set up, every push to `main` will automatically:
1. Build the project
2. Deploy to GitHub Pages
3. Make changes live within 1-2 minutes

To update the game:
```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main
# Wait for GitHub Actions to complete
```

---

## 📝 Maintenance

### Version Updates

When releasing updates:

**1. Update version in package.json:**
```json
{
  "version": "1.1.0"
}
```

**2. Update GAME_SYSTEMS.md if needed**

**3. Create git tag:**
```bash
git tag -a v1.1.0 -m "Version 1.1.0: Feature updates"
git push origin v1.1.0
```

**4. Create GitHub release from tag**

### Monitoring

**Check deployment status:**
- Visit Actions tab in GitHub repository
- Monitor build times and failures
- Review error logs if deployment fails

**User feedback:**
- Enable GitHub Discussions for feedback
- Monitor Issues for bug reports
- Track analytics if configured

---

## 🎯 Success Metrics

Your game is successfully deployed when:
- ✅ Game loads at GitHub Pages URL
- ✅ No console errors in browser
- ✅ All features work as in development
- ✅ Saves persist across sessions
- ✅ Performance is 60 FPS
- ✅ Cross-browser compatible
- ✅ Mobile-friendly (if applicable)

---

## 📧 Support

If you encounter issues:

1. Check GitHub Actions logs
2. Test build locally: `npm run build && npm run preview`
3. Review browser console for errors
4. Check GitHub Pages status: https://www.githubstatus.com/
5. Consult GitHub Pages documentation: https://docs.github.com/pages

---

## 🎊 Congratulations!

Your game is now live and playable by anyone with the link!

**Next Steps:**
- Gather player feedback
- Monitor analytics (if configured)
- Plan future updates
- Fix bugs as reported
- Add new features

**Share your game:**
```
🎮 Outlaw's Last Stand is now live!
Play at: https://SodaPopinzki.github.io/outlaws-last-stand/

A western-themed survivor-like game with:
- 8 unique characters
- 15 weapons + 7 evolutions
- 10 epic boss fights
- Meta progression system

Built with React + Vite
#gamedev #indiedev #webgame
```

---

**Version:** 1.0.0
**Last Updated:** 2024
**License:** MIT (or your chosen license)
