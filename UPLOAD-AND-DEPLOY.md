# Upload to GitHub and deploy on Render

1. Extract this ZIP on your computer.
2. Create a GitHub repository (private is fine).
3. Upload the CONTENTS of this folder into the repository root. package.json and render.yaml must be at the top level, alongside src/ and server/. Keep the folder structure. Include .gitignore if your file picker shows hidden files.
4. In Render, choose New > Blueprint, connect your GitHub repository, and select render.yaml. Review the service plan before creating it. The supplied configuration requests the free plan.
5. Wait for the build and deployment to finish, then open the HTTPS URL Render provides.
6. Test Quick Play and an Online room with two browsers. If the Online screen asks for a server address, use wss://YOUR-SERVICE.onrender.com (replace with your actual service hostname).

Manual Render setup (alternative to Blueprint)
- Service type: Web Service
- Runtime: Node
- Root directory: leave blank
- Build command: npm ci && npm run build
- Start command: npm start
- Environment variable: NODE_VERSION = 22
- Health check path: /health
- Instances: 1

No API keys or database are required. Render supplies PORT automatically.
The free plan sleeps when idle; allow time for the first visit to wake it.
Active rooms are held in memory and are cleared by a restart or deployment.

This package includes the latest stadium preview flicker correction.
It deliberately excludes node_modules, built output, Git history, local settings,
and the existing Sites hosting identity. Render builds the game from source.
