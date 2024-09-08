const { getCache, getCacheFundExtraOptions } = require("../utils/cacheHandler");
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

const getFundExtraOptions = (ctx) => {
    const fundsData = getCacheFundExtraOptions();
    ctx.body = JSON.stringify(fundsData);
};

module.exports = { getFund, getFundExtraOptions };