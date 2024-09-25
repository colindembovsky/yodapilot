import { Request, Response } from 'express';
import { createAckEvent, createDoneEvent, createErrorsEvent, getUserMessage } from "@copilot-extensions/preview-sdk";
import { Octokit } from '@octokit/rest';

export class IndexController {
  constructor() {
    this.postIndex = this.postIndex.bind(this);
  }

  async postIndex(req: Request, res: Response) {
    console.log("Got post to index");

    res.write(createAckEvent());
    await this.doYoda(req, res);
  }

  async doYoda(req: Request, res: Response) {
    let user = "test-user";
    const tokenForUser = req.get("X-GitHub-Token");
    try {
      const octokit = new Octokit({ auth: tokenForUser });
      const userObj = await octokit.request("GET /user");
      const user = userObj.data.login;
      console.log("User:", user);
    } catch (e) {
      //console.log("Error getting user:", e);
    }

    const payload = req.body;
    console.log(`Payload: ${JSON.stringify(payload)}`);

    const messages = (payload && Object.keys(payload).length === 0 && payload.constructor === Object) || !payload.messages ? [] : payload.messages;
    messages.unshift({
      role: "system",
      content: "You are a helpful assistant that replies to user messages as if you were Yoda.",
    });
    messages.unshift({
      role: "system",
      content: `Start every response with the user's name, which is @${user}.`,
    });

    if (payload && payload.messages) {
      const userMessage = getUserMessage(payload);
      console.log(`User message: ${userMessage}`);
    }

    const copilotLLMResponse = await fetch(
      "https://api.githubcopilot.com/chat/completions",
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${tokenForUser}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messages,
          stream: true,
        }),
      }
    );

    if (copilotLLMResponse.body) {
      console.log(`Status from Copilot LLM: ${copilotLLMResponse.status}`);
      if (!copilotLLMResponse.ok) {
        const errorText = await copilotLLMResponse.text();
        console.log(`Error from Copilot LLM: ${errorText}`);
        const errorEvent = createErrorsEvent([
          {
            type: "agent",
            code: `${copilotLLMResponse.status}`,
            message: errorText,
            identifier: "copilot-yoda-agent",
          },
        ]);
        res.write(errorEvent);
        res.end(createDoneEvent());
        return;
      }
      console.log("Got 200-ish - piping to client");
      copilotLLMResponse.body.pipe(res);
    } else {
      const errorEvent = createErrorsEvent([
        {
          type: "agent",
          code: "500",
          message: "No response from Copilot LLM",
          identifier: "copilot-yoda-agent",
        },
      ]);
      res.write(errorEvent);
      res.end(createDoneEvent());
    }
  }
}