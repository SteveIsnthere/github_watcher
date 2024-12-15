import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import {GithubPushPayload} from "./model";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Express');
});

app.post('/', (req: Request, res: Response) => {
    const data: GithubPushPayload = req.body;
    console.log(data);
    res.send('Express');
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});