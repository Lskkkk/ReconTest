const axios = require('axios');
const { formatDate } = require('./date');
const { getCache, updateCache } = require('./cacheHandler');
const { isFundNameValid } = require('./fundName');

const fetchFundByApi = async (id, forceUpdate = false) => {
	if (!forceUpdate || isFundNameValid(id)) {
		const cacheData = getCache(id);
		if (cacheData.length > 0) {
			return cacheData;
		}
	} else {
		console.log(id, 'forceUpdate');
	}

	const response = await axios.get(`https://fund.eastmoney.com/pingzhongdata/${id}.js`);
	const data = response.data;
	if (!data) {
		return [];
	}

	let values = [];
	const regex = /var Data_netWorthTrend = (\[.*?\]);/;
	const matches = data.match(regex);
	if (matches && matches[1]) {
		const netWorthData = JSON.parse(matches[1]);
		let lastDate = '';
		netWorthData.forEach(entry => {
			const date = formatDate(new Date(entry.x));
			const value = entry.y;
			if (lastDate != date && value) {
				values.push({
					date,
					value,
				});
			}
			lastDate = date;
		});
	}
	await updateCache({
		[id]: values,
	});
	return values;
};

module.exports = { fetchFundByApi };
