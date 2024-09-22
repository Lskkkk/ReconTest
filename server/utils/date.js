const formatDate = d =>
	`${d.getFullYear()}-${(d.getMonth() < 9 ? '0' : '') + (d.getMonth() + 1)}-${
		(d.getDate() < 10 ? '0' : '') + d.getDate()
	}`;
const formatDateStr = day => `${day.substring(0, 4)}-${day.substring(4, 6)}-${day.substring(6, 8)}`;
const compareDate = (a, b) => {
	return Number(a.replace(/\-/g, '')) < Number(b.replace(/\-/g, ''));
};
module.exports = { formatDate, formatDateStr, compareDate };
