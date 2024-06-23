import app from "./src/app.js";
import {createWebSocketServer} from "./src/websockets.js";

const port = process.env.NODE_ENV === 'test' ? process.env.TEST_APP_PORT : process.env.APP_PORT

const server = app.listen(port, () => {
    console.log("Server is listening at port: " + port);
});

createWebSocketServer(server);