const { fetchFundByApi } = require("../utils/fundApi");

const getFund = async (ctx) => {
    const { id, forceUpdate = false } = ctx.query;
    if (!id) {
        ctx.body = 'no id';
        return;
    }
    const fundsData = await fetchFundByApi(id, forceUpdate);
    ctx.body = JSON.stringify(fundsData);
};

const getFundSelector = async (ctx) => {
    if (!id) {
        ctx.body = 'no id';
        return;
    }
    const fundsData = await fetchFundByApi(id, forceUpdate);
    ctx.body = JSON.stringify(fundsData);
};

module.exports = { getFund, getFundSelector };