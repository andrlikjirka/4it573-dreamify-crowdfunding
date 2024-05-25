import app from "./src/app.js";
import {createWebSocketServer} from "./src/websockets.js";


const port = 3001;
const server = app.listen(port, () => {
    console.log("Server is listening at port: " + port);
});

createWebSocketServer(server);