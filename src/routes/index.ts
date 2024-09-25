import express from 'express';
import { IndexController } from '../controllers/index.js';

export function setRoutes(app: express.Application): void {
  const indexController = new IndexController();

  app.post('/', express.json(), indexController.postIndex);
}