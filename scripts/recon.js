const nowYear = new Date().getFullYear();

let szValues = [];

const initDom = () => {
	console.log('start render');
	const fundEle = $('#fund-selector');
	const yearEle = $('#start-year-selector');
	const buyEle = $('#buy-rate-selector');
	const saleEle = $('#sale-rate-selector');
	const startMoneyEle = $('#start-money-selector');
	const fieldMoneyEle = $('#field-money-selector');
	const dayEle = $('#day-selector');
	const winEle = $('#win-rate-selector');
	const winYearsEle = $('#win-years-selector');

	Object.keys(funds).forEach(id => {
		fundEle.append(`<option value="${id}">${funds[id].name}</option>`);
	});
	for (let i = 2010; i <= nowYear; i++) {
		yearEle.append(`<option value="${i}">${i}</option>`);
		winYearsEle.append(`<option value="${nowYear - i + 1}">${nowYear - i + 1}</option>`);
	}
	for (let i = 0.5; i < 1; i += 0.02) {
		buyEle.append(`<option value="${i.toFixed(2)}">${i.toFixed(2)}</option>`);
	}
	for (let i = 1.05; i <= 5.2; i += i < 2 ? 0.02 : 0.5) {
		saleEle.append(`<option value="${i.toFixed(2)}">${i.toFixed(2)}</option>`);
	}
	for (let i = 100000; i >= 10000; i -= 10000) {
		startMoneyEle.append(`<option value="${i}">${i}</option>`);
	}
	for (let i = 500; i <= 50000; i += i < 10000 ? (i < 5000 ? 500 : 1000) : 5000) {
		fieldMoneyEle.append(`<option value="${i}">${i}</option>`);
	}
	dayEle.append(`<option value="day">day</option>`);
	dayEle.append(`<option value="month">month</option>`);
	for (let i = 0.95; i >= 0.2; i -= 0.05) {
		winEle.append(`<option value="${i.toFixed(2)}">${i.toFixed(2)}</option>`);
	}

	let lastOptions;
	const restoreOptions = optionData => {
		optionData.fundEle && fundEle.val(optionData.fundEle);
		optionData.yearEle && yearEle.val(optionData.yearEle);
		optionData.buyEle && buyEle.val(optionData.buyEle);
		optionData.saleEle && saleEle.val(optionData.saleEle);
		optionData.startMoneyEle && startMoneyEle.val(optionData.startMoneyEle);
		optionData.fieldMoneyEle && fieldMoneyEle.val(optionData.fieldMoneyEle);
		optionData.dayEle && dayEle.val(optionData.dayEle);
		optionData.winEle && winEle.val(optionData.winEle);
		optionData.winYearsEle && winYearsEle.val(optionData.winYearsEle);
	};
	const saveLastOptions = () => {
		lastOptions = {
			fundEle: fundEle.val(),
			yearEle: yearEle.val(),
			buyEle: buyEle.val(),
			saleEle: saleEle.val(),
			startMoneyEle: startMoneyEle.val(),
			fieldMoneyEle: fieldMoneyEle.val(),
			dayEle: dayEle.val(),
			winEle: winEle.val(),
			winYearsEle: winYearsEle.val(),
		};
		console.log(JSON.stringify(lastOptions));
		localStorage.setItem('lastOptions', JSON.stringify(lastOptions));
	};

	lastOptions = localStorage.getItem('lastOptions');
	if (lastOptions) {
		lastOptions = JSON.parse(lastOptions);
		restoreOptions(lastOptions);
	}
	$('#btn-reload').click(() => {
		localStorage.removeItem(fundEle.val());
		fetchOne(
			fundEle.val(),
			true,
			savedValues => console.log(`fetch ${fundEle.val()} succeed: ${savedValues.length}`),
			true
		);
	});
	$('#btn-recon').click(async () => {
		let originalValues = await fetchOne(fundEle.val());
		saveLastOptions();
		console.clear();
		let values =
			lastOptions.dayEle == 'month' ? getMonthValues(originalValues) : originalValues;
		recon(
			values,
			true,
			lastOptions.fundEle,
			lastOptions.yearEle,
			lastOptions.buyEle,
			lastOptions.saleEle,
			lastOptions.startMoneyEle,
			lastOptions.fieldMoneyEle,
			lastOptions.dayEle == 'month'
		);
		console.log('now value: ', originalValues[originalValues.length - 1]);
	});
	$('#btn-search').click(async () => {
		$('#btn-search').text('searching...');
		let values = await fetchOne(fundEle.val());
		values = dayEle.val() == 'month' ? getMonthValues(values) : values;
		setTimeout(() => {
			let results = [],
				currentWinRate = winEle.val();
			while (results.length == 0) {
				console.clear();
				saveLastOptions();
				results = searching(
					values,
					lastOptions.fundEle,
					lastOptions.yearEle,
					lastOptions.winEle,
					lastOptions.buyEle,
					lastOptions.saleEle,
					lastOptions.startMoneyEle,
					lastOptions.fieldMoneyEle,
					lastOptions.dayEle == 'month',
					lastOptions.winYearsEle
				);
				let currentIndex = 0;
				winEle.find('option').each((i, ele) => {
					if ($(ele).val() == currentWinRate) {
						currentIndex = i + 1;
					}
				});
				if (results.length == 0 && currentIndex < winEle.find('option').length) {
					currentWinRate = winEle.find(`option:nth-child(${currentIndex + 1})`).val();
					winEle.val(currentWinRate);
				} else {
					break;
				}
			}
			$('#btn-search').text('search');
		}, 10);
	});
	$('#btn-reset').click(async () => {
		yearEle.find('option:first').prop('selected', true);
		buyEle.find('option:first').prop('selected', true);
		saleEle.find('option:first').prop('selected', true);
		startMoneyEle.find('option:first').prop('selected', true);
		fieldMoneyEle.find('option:first').prop('selected', true);
		winEle.find('option:nth-child(4)').prop('selected', true);
		let values = await fetchOne(fundEle.val());
		const startYear = Number(values[0].date.substring(0, 4));
		yearEle.find('option').each((i, ele) => {
			if ($(ele).text() == String(startYear)) {
				$(ele).prop('selected', true);
			}
		});
		winYearsEle.find('option').each((i, ele) => {
			if ($(ele).text() == String(nowYear - startYear)) {
				$(ele).prop('selected', true);
			}
		});
	});
	yearEle.change(() => {
		const selectedOption = yearEle.find('option:selected');
		winYearsEle.val(nowYear - Number(selectedOption.val()));
	});
	$('#btn-addStrategy').click(() => {
		Object.keys(funds).forEach(id => {
			if (id == fundEle.val()) {
				funds[id].bestStrategy = funds[id].bestStrategy || '';
				const strList = funds[id].bestStrategy.split('|').filter(s => s);
				const index = strList.findIndex(f => f.includes(dayEle.val()));
				const str = [
					yearEle.val(),
					buyEle.val(),
					saleEle.val(),
					startMoneyEle.val(),
					fieldMoneyEle.val(),
					dayEle.val(),
				].join(',');
				if (index == -1) {
					strList.push(str);
				} else {
					strList.splice(index, 1, str);
				}
				funds[id].bestStrategy = strList.join('|');
				console.log('addStrategy:', funds[id].name, funds[id].bestStrategy);
			}
		});
		saveFunds();
	});
	$('#btn-readStrategy').click(() => {
		const fund = funds[fundEle.val()];
		const strList = fund.bestStrategy.split('|');
		let str = strList.find(f => f.includes(dayEle.val()));
		if (str) {
			str = str.split(',');
			restoreOptions({
				yearEle: str[0],
				buyEle: str[1],
				saleEle: str[2],
				startMoneyEle: str[3],
				fieldMoneyEle: str[4],
				dayEle: str[5],
			});
		} else {
			console.error('not found');
		}
	});
	$('#btn-deleteStrategy').click(() => {
		let strList = funds[fundEle.val()].bestStrategy
			.split('|')
			.filter(f => !f.includes(dayEle.val()));
		funds[fundEle.val()].bestStrategy = strList.join('|');
		console.log('deleted, left: ', funds[fundEle.val()].bestStrategy);
		saveFunds();
	});
	let month_logs = [],
		day_logs = [];
	$('#btn-runAllStrategy').click(async () => {
		console.clear();
		month_logs = [];
		day_logs = [];
		Object.keys(funds).forEach(async id => {
			if (funds[id].bestStrategy) {
				let values = await fetchOne(id);
				const strList = funds[id].bestStrategy.split('|');
				strList.forEach(async s => {
					const str = s.split(',');
					const originalValues = await fetchOne(id);
					const isMonth = str[5] == 'month';
					let values = isMonth ? getMonthValues(originalValues) : originalValues;
					const [profit, , maxLost, winRate, progress, costValue, lastBuyDate, maxReturn] = recon(
						values,
						false,
						id,
						Number(str[0]),
						Number(str[1]),
						Number(str[2]),
						Number(str[3]),
						Number(str[4]),
						isMonth
					);
					const currentValue = originalValues[originalValues.length - 1];
					const _log = [
						funds[id].name,
						'\n' + str,
						'\nprofit: ' + Object.values(profit).reduce((pv, s) => s + pv, 0),
						'winRate: ' + winRate,
						'\nlast: ' + lastBuyDate + (isMonth ? ' ' : ''),
						'costValue:    ' + costValue.toFixed(3),
						'maxLost:     ' + maxLost.toFixed(3),
						'maxReturn:   ' + -maxReturn,
						'\nnow:  ' + currentValue.date,
						'currentValue: ' + currentValue.value.toFixed(3),
						'currentLost: ' +
						(costValue == 0
							? 0
							: ((currentValue.value - costValue) / costValue).toFixed(3)),
						'\nprogress: ' + progress,
					].join('|');
					if (isMonth) {
						month_logs.push(_log);
					} else {
						day_logs.push(_log);
					}
					console.log(id, 'recon finished!');
				});
			}
		});
		setTimeout(() => {
			Object.keys(funds).forEach(id => {
				console.log(
					'******************************************************************************************************'
				);
				day_logs.forEach(d => {
					if (d.includes(funds[id].name)) {
						console.log(...d.split('|'));
					}
				});
				month_logs.forEach(d => {
					if (d.includes(funds[id].name)) {
						console.log(...d.split('|'));
					}
				});
			});
		}, 1000);
	});
};
setTimeout(initDom, 500);

function maxDifference(arr) {
	if (arr.length < 2) {
		return 0;
	}

	let maxVal = Math.max(...arr);
	let minVal = Math.min(...arr);

	return maxVal - minVal;
}

const fetchOne = async (id, force = false, cb = () => ({}), forceUpdate = false) => {
	let apiUrl = `http://localhost:3000/getFund?id=${id}`;
	if (forceUpdate) {
		apiUrl += `&forceUpdate=${forceUpdate}`;
	}
	const values = await fetch(apiUrl)
		.then(response => response.text())
		.then(data => {
			const values = JSON.parse(data);
			cb(values);
			return values;
		});
	return values;
};

const getMonthValues = dayValues => {
	if (dayValues.length == 0) return [];
	const monthValues = [];
	let daysInMonth = [];
	let currentMonth = dayValues[0].date.substring(0, 7);
	dayValues.forEach(d => {
		if (currentMonth == d.date.substring(0, 7)) {
			daysInMonth.push(d);
		} else {
			monthValues.push({
				value: Number(
					(daysInMonth.reduce((s, pv) => s + pv.value, 0) / daysInMonth.length).toFixed(4)
				),
				date: currentMonth,
			});
			daysInMonth = [d];
			currentMonth = d.date.substring(0, 7);
		}
	});
	monthValues.push({
		value: Number(
			(daysInMonth.reduce((s, pv) => s + pv.value, 0) / daysInMonth.length).toFixed(4)
		),
		date: currentMonth,
	});
	return monthValues;
};

fetchOne('上证综合指数').then(data => (szValues = data || []));

const recon = (
	values,
	showLog,
	id,
	_startYear,
	_buyRate,
	_saleRate,
	_startMoney,
	_oneFieldMoney,
	isMonth
) => {
	let startYear = Number(_startYear);
	let buyRate = Number(_buyRate);
	let saleRate = Number(_saleRate);
	let startMoney = Number(_startMoney);
	let oneFieldMoney = Number(_oneFieldMoney);
	let startValue = values[0].value;
	let startField = startMoney / startValue;
	let totalMoney = startMoney;
	let costValue = 0;
	let totalField = 0;
	let maxLost = 0,
		periodLost = 0;
	let maxReturnValue = 0, maxReturn = 0;
	const profit = {};
	const endValue = values[values.length - 1].value;
	let recordStartValue = 0;
	let winCount = 0;
	let winCountTotal = 0;
	let lastBuyDate = '';
	let rightSzValues = isMonth ? getMonthValues(szValues) : szValues;
	values.forEach((obj, index) => {
		if (obj.date.substring(0, 4) < String(startYear)) return;
		const currentValue = obj.value;
		if (!recordStartValue) {
			recordStartValue = currentValue;
		}
		const rate = costValue > 0 ? currentValue / costValue : 0;

		if (totalField > 0 && rate >= saleRate) {
			const field = totalField;
			totalField -= field;
			totalMoney += field * currentValue;
			profit[obj.date.substring(0, 4)] =
				(profit[obj.date.substring(0, 4)] ? profit[obj.date.substring(0, 4)] : 0) +
				Math.floor(field * (currentValue - costValue));
			showLog &&
				console.log(
					`[SSSS] ${obj.date}: `,
					Math.floor(totalMoney),
					Math.floor(totalField),
					`+${Math.floor(field * (currentValue - costValue))}`,
					currentValue,
					costValue,
					periodLost.toFixed(3),
					recordStartValue
				);
			recordStartValue = currentValue;
			costValue = totalField == 0 ? 0 : costValue;
			totalMoney = startMoney;
			periodLost = 0;
		}
		recordStartValue = Math.max(recordStartValue, currentValue);
		let buyM = oneFieldMoney;
		const buyObj = isMonth ? values[index] : values[index + 1];
		const rateWrapper = isMonth ? 1.02 : 1;
		const szVal = rightSzValues.find(v => v.date == obj.date);
		if (
			totalMoney >= buyM &&
			recordStartValue * buyRate >= currentValue &&
			rate < rateWrapper &&
			buyObj &&
			(id.includes('沪深300') && szVal ? szVal.value <= 3000 : true)
		) {
			const buyValue = buyObj.value;
			const field = buyM / buyValue;
			costValue = (costValue * totalField + buyM) / (totalField + field);
			totalField += field;
			totalMoney -= buyM;
			showLog &&
				console.log(
					`[B] ${obj.date}: `,
					Math.floor(totalMoney),
					currentValue,
					costValue,
					(currentValue / costValue - 1).toFixed(3)
				);
			lastBuyDate = buyObj.date;
		}
		if (totalField < 0 || totalMoney < 0) {
			console.error(`err ${obj.date}:`, totalMoney, totalField, currentValue, currentValue);
		}
		if (totalField > 0) {
			const currentLost = currentValue / costValue - 1;
			maxLost = Math.min(currentLost, maxLost);
			periodLost = Math.min(currentLost, periodLost);
			if (currentLost > 0) {
				winCount++;
			}
			winCountTotal++;

			maxReturnValue = Math.max(maxReturnValue, currentValue);
			const currentReturn = Number(((maxReturnValue - currentValue) / maxReturnValue).toFixed(3));
			maxReturn = Math.max(maxReturn, currentReturn);
		}
	});
	const finalMoney = totalMoney + totalField * endValue;
	const totalProfit = Object.values(profit).reduce((pv, s) => s + pv, 0);
	showLog &&
		console.log(
			`end:`,
			totalMoney,
			endValue,
			costValue,
			((endValue - costValue) / costValue).toFixed(3),
			maxLost.toFixed(3),
			totalProfit,
			-maxReturn
		);
	showLog && console.log('profit: ', profit, totalProfit);
	showLog &&
		console.log(
			'winRate: ',
			winCount,
			'/',
			winCountTotal,
			'=',
			(winCount / winCountTotal).toFixed(3),
			'emptyRate: ',
			(1 - winCountTotal / values.length).toFixed(3)
		);
	const progress = ((startMoney - totalMoney) / startMoney).toFixed(2) * 100;
	showLog && console.log('progress: ', progress);
	return [
		profit,
		finalMoney,
		maxLost,
		(winCount / winCountTotal).toFixed(3),
		progress,
		costValue,
		lastBuyDate,
		maxReturn
	];
};

const searching = (
	values,
	id,
	_startYear,
	_winRate,
	_buyRate,
	_saleRate,
	_startMoney,
	_oneFieldMoney,
	isMonth,
	_winYears
) => {
	let results = [];
	let startYear = Number(_startYear);
	let startMoney = Number(_startMoney);
	let oneFieldMoney = Number(_oneFieldMoney);
	let winYears = Number(_winYears);
	for (let buyRate = Number(_buyRate); buyRate < 1; buyRate += 0.02) {
		for (
			let saleRate = Number(_saleRate);
			saleRate <= 5.2;
			saleRate += saleRate < 2 ? 0.02 : 0.5
		) {
			for (
				let oneMoney = oneFieldMoney;
				oneMoney <= (isMonth ? startMoney / 4 : startMoney / 10);
				oneMoney += oneMoney >= 10000 ? 5000 : 500
			) {
				const [current, finalMoney, maxLost, winRate] = recon(
					values,
					false,
					id,
					startYear,
					buyRate,
					saleRate,
					_startMoney,
					oneMoney,
					isMonth
				);
				const curPro = Object.values(current).reduce((pv, s) => s + pv, 0);
				const proGap = maxDifference(Object.values(current));
				const years = Object.values(current).length;
				results.push({
					profit: curPro,
					maxLost,
					years,
					winRate,
					saleRate,
					buyRate,
					startMoney: startMoney,
					oneFieldMoney: oneMoney,
					logs: `[max]: ${Object.values(current).length}, ${buyRate.toFixed(
						2
					)}, ${saleRate.toFixed(2)}, ${oneMoney}, ${curPro}, ${maxLost.toFixed(
						3
					)}, ${winRate}, ${proGap}`,
				});
			}
		}
	}

	results.sort((a, b) => b.profit - a.profit);
	window._results = results;
	results = results
		.filter(r => r.maxLost >= -0.2 && r.winRate >= Number(_winRate) && r.years >= winYears)
		.slice(0, 10)
		.reverse();
	results.forEach(r => {
		console.log(r.logs);
	});
	return results;
};
