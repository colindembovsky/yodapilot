import { Request, Response } from 'express';

class IndexController {
  getIndex(req: Request, res: Response) {
    res.send('Hello, world!');
  }
}

export default IndexController;