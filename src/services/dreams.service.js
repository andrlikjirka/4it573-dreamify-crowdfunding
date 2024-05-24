import {Dream} from "../model/dream.model.js";
import {Contribution} from "../model/contribution.model.js";

export const findShowedAcceptedDreams = async () => {
    const dreams  = await Dream.find(
        {status: 'approved', showed: true, deleted: false},
        {},
        {}).sort({created: -1});
    return dreams;
};

export const findShowedAcceptedDreamsByCategory = async (category) => {
    const dreams  = await Dream.find(
        {category: category, status: 'approved', showed: true, deleted: false},
        {},
        {}).sort({created: -1});
    return dreams;
};

export const findAllDreams = async () => {
    const dreams  = await Dream.find(
        {deleted: false},
        {},
        {}).sort({created: -1});
    return dreams;
};

export const findDreamsByAuthorId = async (id) => {
    const dreams = await Dream.find(
        {"author.author_id": id, deleted: false},
        {},
        {}).sort({created: -1});
    return dreams;
};

export const getDreamById = async (id) => {
    const dream  = await Dream.findById(
        {_id: id},
        {},
        {});
    return dream;
};

export const findAllContributionsByDreamId = async (id) => {
    const contributions = await Contribution.find(
        {"dream.dream_id": id},
        {},
        {}
    ).sort({contributedAt: -1});
    return contributions;
};