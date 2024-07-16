import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config()
const app = express();

app.use(cors());
app.use(express.json());

app.use("/", (req, res) => {
    res.send({
        message: "welcome to body works api",
    });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});
