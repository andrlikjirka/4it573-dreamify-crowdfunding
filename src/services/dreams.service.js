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
    const dream  = await Dream.findOne(
        {_id: id, deleted: false},
        {},
        {});
    return dream;
};

export const getShowedDreamById = async (id) => {
    const dream  = await Dream.findOne(
        {_id: id, showed: true, deleted: false},
        {},
        {});
    return dream;
};

export const findAllContributionsByDreamId = async (id) => {
    const contributions = await Contribution.find(
        {"dream.dream_id": id, "payment.payment_status": 'COMPLETED'},
        {},
        {}
    ).sort({contributedAt: -1});
    return contributions;
};

export const saveNewContribution = async (contributionData) => {
    const contribution = new Contribution(contributionData);
    try {
        await contribution.save();
    } catch (err) {
        console.error(err.message);
    }
    return contribution;
}

export const saveContributionToDream = async (newContribution, dream, paymentToken) => {
    const contribution = new Contribution(newContribution);


}

export const getContributionById = async (id) => {
    const contribution = await Contribution.findOne(
        {_id: id},
        {},
        {});
    return contribution;
}