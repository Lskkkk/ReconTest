const isFundNameValid = name => name.includes('全收益') || name == '上证综合指数';

module.exports = {
	isFundNameValid,
};
