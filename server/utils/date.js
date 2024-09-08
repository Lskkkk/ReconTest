const formatDate = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const formatDateStr = day => `${day.substring(0, 4)}-${day.substring(4, 6)}-${day.substring(6, 8)}`;

module.exports = { formatDate, formatDateStr };