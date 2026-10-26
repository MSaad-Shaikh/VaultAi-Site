# VaultAI demo email Worker

GitHub Pages serves the website but cannot run the Node email server or safely store a Resend API key. This Cloudflare Worker provides the small email endpoint used by the hosted demo. It does not process payments or create real subscriptions.

## Deploy once

1. Install Node.js on the computer used for deployment.
2. Open a terminal in this `worker` folder.
3. Run `npx wrangler login` and sign in to Cloudflare.
4. Add the Resend API key as a Cloudflare secret: `npx wrangler secret put RESEND_API_KEY`.
5. Add the single inbox that is allowed to receive demo emails: `npx wrangler secret put DEMO_RECIPIENT_EMAIL`. Enter the email address you will use for the presentation. The website form only sends to this configured address.
6. Deploy with `npx wrangler deploy`.
7. Copy the deployed `https://…workers.dev` URL into `app-config.js` as `window.VAULTAI_DEMO_API_BASE_URL`, without a trailing slash. For example:

   ```js
   window.VAULTAI_DEMO_API_BASE_URL = 'https://vaultai-demo-email.<your-subdomain>.workers.dev';
   ```

8. Commit and push the site to GitHub. Once Pages publishes the new `app-config.js`, the demo checkout will call the Worker.

The Worker configuration already allows the current GitHub Pages origin and uses the current project-site URL for links in the email. If the repository owner, repository name, or Pages domain changes, update `ALLOWED_ORIGIN` and `PUBLIC_BASE_URL` in `wrangler.jsonc` before deploying again.

## Secrets and demo limits

- Never put `RESEND_API_KEY` in `app-config.js`, HTML, or a committed file. The Worker reads it from Cloudflare's secret store.
- `.dev.vars.example` is a local template only. Copy it to `.dev.vars` for local Worker development, then fill in local values. `.dev.vars` is ignored by Git.
- `DEMO_RECIPIENT_EMAIL` intentionally limits email delivery to one configured inbox, which is appropriate for a classroom presentation and reduces abuse of a public demo endpoint.
- The generated activation key is display-only. No payment is charged and no real subscription is provisioned.
- Basic provides the ZIP download immediately. Custom says the customized build will be provided in 2–3 working days.

## Local Worker preview (optional)

From this folder, copy `.dev.vars.example` to `.dev.vars`, fill in the secrets, and run `npx wrangler dev`. For the simpler local website demo, use the root `Start VaultAI Demo.bat` instead; it starts `server.js` on `127.0.0.1:4187`.
