import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import {GithubPushPayload} from "./model";
import {processWebhook} from "./data_processing";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 8854;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('why are you here?');
});

app.post('/', async (req: Request, res: Response) => {
    await processWebhook(req.body as GithubPushPayload);
    res.send('ok');
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});