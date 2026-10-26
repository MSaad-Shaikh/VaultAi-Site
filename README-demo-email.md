# VaultAI presentation demo

This local demo has no real payment gateway. Completing the demo checkout creates a clearly labelled sample subscription and product key. If Resend is configured, the server sends the confirmation email to the address entered.

## Start it

1. Copy .env.example to .env.
2. Replace re_your_api_key with the real Resend API key from your account.
3. Double-click Start VaultAI Demo.bat.
4. Open http://127.0.0.1:4187 in your browser and use a plan link.

The API key stays in .env on the server and is never sent to the browser. Do not commit .env or paste the key into HTML.

The default sender is VaultAI <onboarding@resend.dev>. Use the sender/domain and recipient addresses permitted by your Resend account. Resend shows onboarding@resend.dev in its send examples and provides delivered@resend.dev as a test recipient. For delivery to a real inbox, use a recipient allowed by your account; verify a domain and use a sender on that domain if Resend requires it.

Without a valid API key, the demo still shows the generated activation details and email preview, but clearly reports that no message was sent.

## Demo plan behavior

- Basic: demo access active for one month; ZIP download is available immediately.
- Custom: demo access active for one month; the confirmation email says the customized software will be provided in 2–3 working days.
- Keys begin with VAI-DEMO and are display-only; they do not activate the packaged app.
- No payment is collected, and the demo does not create a real subscription.



## GitHub Pages deployment

GitHub Pages only serves the static website, so it cannot run `server.js` or keep an email API key private. For the hosted demo, deploy the small Cloudflare Worker in `worker/` and keep the Resend key there as a Worker secret. Follow `worker/README.md` for the exact setup. After deployment, put the Worker URL in `app-config.js` and push the site files to GitHub Pages.

The public presentation demo is restricted to one configured recipient address (`DEMO_RECIPIENT_EMAIL`). That keeps a public demo endpoint from being used to send arbitrary emails. Set it to the inbox you will use during the presentation. No payment is collected; the subscription and product key are demo-only.
