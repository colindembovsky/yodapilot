import { Request, Response } from 'express';
import { createAckEvent, createDoneEvent, createTextEvent } from "@copilot-extensions/preview-sdk";

export class IndexController {
  getIndex(req: Request, res: Response) {
    const ackEvent = createAckEvent();
    const textEvent = createTextEvent("Hello, world!");
    const doneEvent = createDoneEvent();

    res.write(ackEvent);
    res.write(textEvent);
    res.end(doneEvent);
  }
}