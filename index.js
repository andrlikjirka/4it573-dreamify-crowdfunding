import app from "./src/app.js";
import {createWebSocketServer} from "./src/websockets.js";
import {PORT} from "./src/utils.js";

const server = app.listen(Number(PORT), () => {
    console.log("Server is listening at port: " + Number(PORT));
});

createWebSocketServer(server);