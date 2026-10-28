import 'dotenv/config';
import express from 'express';
import routes from './routes/routes';
const app = express();
const PORT  = process.env.PORT;
 
app.use(express.json())
app.use("/api", routes)

//  server running port as we know
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
} )
