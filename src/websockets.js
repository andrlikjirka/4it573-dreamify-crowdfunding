import {WebSocketServer} from "ws";
import nunjucks from "nunjucks";
import {
    findAllContributionsByDreamId,
    findShowedAcceptedDreams,
    findShowedAcceptedDreamsByCategory,
    getDreamById
} from "./services/dreams.service.js";
import app from "./app.js";

const connections = new Set();

export const createWebSocketServer = (server) => {
    const wss = new WebSocketServer({server});

    wss.on("connection", (socket) => {
        connections.add(socket);

        console.log("New connection", connections.size);

        socket.on("close", () => {
            connections.delete(socket);

            console.log("Closed connection", connections.size);
        });
    });
};

export const sendDreamsListToAllConnections = async () => {
    const dreamsList = await nunjucks.render('public/dreams/_dreams.html', {
        dreams: await findShowedAcceptedDreams()
    });

    for (const connection of connections) {
        connection.send(JSON.stringify({
                type: 'dreamsList',
                html: dreamsList
            }
        ));
    }
};

export const sendDreamsListByCategoryToAllConnections = async (category) => {
    const dreamsList = await nunjucks.render('public/dreams/_dreams.html', {
        dreams: await findShowedAcceptedDreamsByCategory(category)
    });

    for (const connection of connections) {
        connection.send(JSON.stringify({
                type: 'dreamsListByCategory',
                category: category,
                html: dreamsList
            }
        ));
    }
};

export const sendDreamCardToAllConnections = async (id) => {
    const dream = await getDreamById(id);
    const dreamCardHtml = await nunjucks.render('public/dreams/_dream.card.html', {
        dream: dream,
        categories: app.locals.categories
    });

    for (const connection of connections) {
        console.log('sending dreamCard: ' + dream._id)
        connection.send(JSON.stringify({
            type: 'dreamCard',
            dreamId: dream._id,
            html: dreamCardHtml
        }));
    }
};

export const sendDreamDetailToAllConnections = async (id) => {
    const dream = await getDreamById(id);
    const contributions = await findAllContributionsByDreamId(id);

    const dreamDetailHtml = await nunjucks.render('public/dreams/_dream.detail.html', {
        dream: dream,
        contributions: contributions,
        categories: app.locals.categories
    });

    for (const connection of connections) {
        connection.send(JSON.stringify({
            type: 'dreamDetail',
            dreamId: dream._id,
            html: dreamDetailHtml
        }));
    }
};
