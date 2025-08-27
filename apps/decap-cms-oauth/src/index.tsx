// Based on https://github.com/sterlingwes/decap-proxy
import { type Context, Hono } from "hono";
import { html } from "hono/html";
import { OAuthClient } from "./oauth";

interface Env {
  GH_OAUTH_ID: string;
  GH_OAUTH_SECRET: string;
}

const createOAuth = (env: Env) => {
  return new OAuthClient({
    id: env.GH_OAUTH_ID,
    secret: env.GH_OAUTH_SECRET,
    target: {
      tokenHost: "https://github.com",
      tokenPath: "/login/oauth/access_token",
      authorizePath: "/login/oauth/authorize",
    },
  });
};

const getHostname = (c: Context) => {
  return new URL(c.req.url).hostname;
};

const app = new Hono<{ Bindings: Env }>();

app.use(async (c, next) => {
  const provider = c.req.query("provider");
  if (provider !== "github") {
    return c.text("Invalid provider", { status: 400 });
  }
  await next();
});

app.get("/auth", (c) => {
  const oauth2 = createOAuth(c.env);

  const authorizationUri = oauth2.authorizeURL({
    redirect_uri: `https://${getHostname(c)}/callback?provider=github`,
    scope: "public_repo,user",
    state: crypto.randomUUID(),
  });

  return c.text("Redirecting...", {
    status: 302,
    headers: { Location: authorizationUri },
  });
});

app.get("/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) {
    return c.text("Missing code", { status: 400 });
  }

  const oauth2 = createOAuth(c.env);
  const token = await oauth2.getToken({
    code,
    redirect_uri: `https://${getHostname(c)}/callback?provider=github`,
  });

  return c.html(
    <html lang="en">
      <head>
        {html`<script>
          const receiveMessage = (message) => {
            window.opener.postMessage(
              "authorization:github:success:${JSON.stringify({ token })}",
              "*",
            );
            window.removeEventListener("message", receiveMessage, false);
          };
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        </script>`}
        <body>
          <p>Authorizing Decap...</p>
        </body>
      </head>
    </html>,
  );
});

export default app;
