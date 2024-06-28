# README

## Description

This project is a Slack bot that integrates with the OpenAI Assistant API. The bot can be used to automate various tasks within the Slack workspace. The bot is built using Node.js.

## Installation

To install and run the Slack bot, follow these steps:

1. Clone the repository: `git clone https://github.com/utvara/slack-assistant-bot`
2. Navigate to the project directory: `cd slack-assistant-bot`
3. Install dependencies: `npm install`
4. Set up the environment variables:

- Create a `.env` file in the root directory.
- Add the following variables to the `.env` file:
  ```
  OPENAI_API_KEY=openai_api_key
  OPENAI_ASSISTANT_ID=openai_assistant_id
  OPENAI_MODEL=openai_model
  SLACK_BOT_TOKEN=slack_bot_token
  SLACK_APP_TOKEN=slack_app_token
  SLACK_SIGNING_SECRET=slack_signing_secret
  CREATE_TICKET_SUPPORT_CHANNEL_ID=slack_support_channel_id
  ```

5. Build the bot: `npm run build`
6. Start the bot: `npm start`

## Resources

- [OpenAI Assistant](https://platform.openai.com/docs/assistants/overview)
- [Slack App](https://api.slack.com/docs/apps)
- [Slack App Manifest example](doc/slack_app_manifest.yaml)
- [Assistant prompt example](system_prompt.txt)
- [Assistant function definition example](src/application/plugin/createTicketPluginFunctionDefinition.json)

## Contributing

If you would like to contribute to this project, follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit them: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request.

## Acknowledgment

Special thanks to [hollaugo](https://github.com/hollaugo). Their [slack-openai-assistants](https://github.com/hollaugo/slack-openai-assistants) repository has been a valuable resource and inspiration.

## License

This project is licensed under the [MIT License](LICENSE).
