import { Request, Response } from 'express';
import { createAckEvent, createDoneEvent, createErrorsEvent } from "@copilot-extensions/preview-sdk";
import { Readable } from 'stream';
import fetch from 'node-fetch';

export class IndexController {
  constructor() {
    this.getIndex = this.getIndex.bind(this);
  }

  async getIndex(req: Request, res: Response) {
    const ackEvent = createAckEvent();
    
    res.write(ackEvent);
    await this.doYoda(req, res);
  }

  async doYoda(req: Request, res: Response) {
    const doneEvent = createDoneEvent();
    
    const userName = "bob";
    const messages = req.body.messages || [];
    messages.unshift({
      role: "system",
      content: "You are a helpful assistant that replies to user messages as if you were Yoda.",
    });
    messages.unshift({
      role: "system",
      content: `Start every response with the user's name, which is @${userName}`,
    });

    console.log("Token is ", process.env.TOKEN);

    const copilotLLMResponse = await fetch(
      "https://api.githubcopilot.com/chat/completions",
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${process.env.TOKEN}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messages,
          stream: true,
        }),
      }
    );

    if (copilotLLMResponse.body) {
      console.log("Got response - piping to client");
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
      res.end(doneEvent);
    }
  }
}