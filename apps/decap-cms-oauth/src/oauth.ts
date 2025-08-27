type OAuthConfig = {
  id: string;
  secret: string;
  target: {
    tokenHost: string;
    tokenPath: string;
    authorizePath: string;
  };
};

export class OAuthClient {
  #config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.#config = config;
  }

  authorizeURL(options: {
    redirect_uri: string;
    scope: string;
    state: string;
  }) {
    const { tokenHost, authorizePath } = this.#config.target;
    const { redirect_uri, scope, state } = options;

    return `${tokenHost}${authorizePath}?response_type=code&client_id=${this.#config.id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`;
  }

  async getToken(options: { code: string; redirect_uri: string }) {
    const { tokenHost, tokenPath } = this.#config.target;
    const { code, redirect_uri } = options;

    const response = await fetch(`${tokenHost}${tokenPath}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: this.#config.id,
        client_secret: this.#config.secret,
        code,
        redirect_uri,
        grant_type: "authorization_code",
      }),
    });

    const json = (await response.json()) as { access_token: string };
    return json.access_token;
  }
}
