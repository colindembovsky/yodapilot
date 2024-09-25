# YodaPilot - a Copilot Extension

This is a simple Copilot Extension using TypeScript.

## Getting a Token for testing

A token is required for authenticating to the Copilot LLM via API. The high level process is:

1. Create a GitHub App (on an org or user)
1. Check `Enable Device Flow` in the App Settings so that you can get a token for testing.
1. Complete the **Copilot** settings for the app, registering it as an `Agent`. For local testing you can use any URL other than `localhost` - if you want to use this extension in production, you'll have to deploy it and provide its real URL.

You can now follow the device flow to get a token.

### Device Flow Login to get a token

Follow the steps outlined [here](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#overview-of-the-device-flow)

1. Send a `POST` to `https://github.com/login/device/code` with the client ID of the GitHub app. The response will have a `verification_uri` as well as both `device_code` and `user_code`. Navigate to the `verification_uri` and use the `user_code` to log in.
1. Once you have logged in, send a `POST` to `https://github.com/login/oauth/access_token` with the `client_id` of the GitHub App, the `device_code` from the previous call, and `grant_type=urn:ietf:params:oauth:grant-type:device_code`.
1. The response will have an `access_token`. Save this as `TOKEN` for the next step.

## Running the sample using the `gh-debug-cli`

To get started with the project, follow these steps:

1. Clone the repository.
1. Install the dependencies by running `yarn install`.
1. Install the [`gh-debug-cli`](https://github.com/copilot-extensions/gh-debug-cli)
1. Start the server by running `yarn dev`.
1. In a new terminal, run the following:
```bash
export URL=http://localhost:3000
export LOG-LEVEL=TRACE
export TOKEN=<token from the device flow section>

gh debug-cli
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.