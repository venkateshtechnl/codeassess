<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0bcf7d12-5d60-4a13-a689-d66020aaeaec

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy on Render (free)
1. Push this folder to a GitHub repo.
2. On render.com: New -> Blueprint -> select the repo (uses render.yaml).
3. Deploy. Note: the free tier has an ephemeral disk, so data in data/codeassess_db.json resets on redeploy.
