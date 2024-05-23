import {Dream} from "../model/dream.model.js";

export const findShowedAcceptedDreams = async () => {
    const dreams  = await Dream.find(
        {status: 'approved', showed: true, deleted: false},
        {},
        {});
    return dreams;
};

export const findShowedAcceptedDreamsByCategory = async (category) => {
    const dreams  = await Dream.find(
        {category: category, status: 'approved', showed: true, deleted: false},
        {},
        {});
    return dreams;
};

