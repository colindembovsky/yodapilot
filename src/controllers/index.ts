import { Request, Response } from 'express';
import { createAckEvent, createDoneEvent, createErrorsEvent, getUserMessage } from "@copilot-extensions/preview-sdk";
import { Octokit } from '@octokit/rest';
import { Readable } from 'stream';

export class IndexController {
  constructor() {
    this.postIndex = this.postIndex.bind(this);
  }

  async postIndex(req: Request, res: Response) {
    //console.log("Got post to index");

    res.write(createAckEvent());
    await this.doYoda(req, res);
  }

  async doYoda(req: Request, res: Response) {
    let { tokenForUser, user } = await this.getTokenAndUsername(req);

    const payload = req.body;
    if (payload && payload.messages) {
      const userMessage = getUserMessage(payload);
      //console.log(`User message: ${userMessage}`);
    }

    const messages = this.prepareMessages(payload, user);
    const copilotLLMResponse = await this.fetchCopilotLLMResponse(tokenForUser, messages);
    await this.handleCopilotLLMResponse(copilotLLMResponse, res);
  }

  async fetchCopilotLLMResponse(tokenForUser: string, messages: any) {
    return await fetch("https://api.githubcopilot.com/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${tokenForUser}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        messages,
        stream: true,
      }),
    });
  }

  async handleCopilotLLMResponse(copilotLLMResponse: any, res: any) {
    if (copilotLLMResponse.body) {
      //console.log(`Status from Copilot LLM: ${copilotLLMResponse.status}`);
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
      //console.log("Got ok from LLM - piping to client");
      Readable.from(copilotLLMResponse.body as any).pipe(res);
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

  prepareMessages(payload: any, user: string): any[] {
    const messages = (payload && Object.keys(payload).length === 0 && payload.constructor === Object) || !payload.messages ? [] : payload.messages;
    messages.unshift({
      role: "system",
      content: "You are a helpful assistant that replies to user messages as if you were Yoda.",
    });
    messages.unshift({
      role: "system",
      content: `Start every response with the user's name, which is @${user}.`,
    });
    return messages;
  }

  async getTokenAndUsername(req: Request): Promise<{ tokenForUser: string, user: string }> {
    let user = "test-user";
    const tokenForUser = req.get("X-GitHub-Token") ?? "";
    try {
      const octokit = new Octokit({ auth: tokenForUser });
      const userObj = await octokit.request("GET /user");
      user = userObj.data.login;
      //console.log("User:", user);
    } catch (e) {
      //console.log("Error getting user:", e);
    }
    return { tokenForUser, user };
  }
}