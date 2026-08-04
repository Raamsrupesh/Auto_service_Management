import { log } from "node:console";
import app from "./src/app.js";


app.listen(3000, ()=>log(`Serving at http://localhost:3000/`))

