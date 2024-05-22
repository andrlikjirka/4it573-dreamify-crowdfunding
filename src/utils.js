export const translateDreamStatus = (dreamStatus) => {
    switch (dreamStatus) {
        case 'waiting':
            return 'Čeká na schválení';
        case 'approved':
            return 'Schválený';
        case 'cancelled':
            return 'Zamítnutý';
        case 'successful':
            return 'Úspěšný';
        case 'failed':
            return 'Neúspěšný';
        default:
            return 'neznámá';
    }
};
