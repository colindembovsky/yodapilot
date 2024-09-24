import { Request, Response } from 'express';

export class IndexController {
  getIndex(req: Request, res: Response) {
    res.send('Hello, world!');
  }
}