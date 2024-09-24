import express from 'express';
import { setRoutes } from './routes';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setRoutes(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});