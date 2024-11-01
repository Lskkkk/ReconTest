const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const { formatDate } = require('./date');

const links = [
	{
		url: 'https://www.csindex.com.cn/#/indices/family/detail?indexCode=931446',
		matchName: '东证红利低波全收益'
	},
	{
		url: 'https://www.csindex.com.cn/#/indices/family/detail?indexCode=930050',
		matchName: '中证A50全收益'
	},
	{
		url: 'https://www.csindex.com.cn/#/indices/family/detail?indexCode=000001',
		matchName: ''
	},
	{
		url: 'https://www.csindex.com.cn/#/indices/family/detail?indexCode=000300',
		matchName: '300收益'
	},
	{
		url: 'https://www.csindex.com.cn/#/indices/family/detail?indexCode=931069',
		matchName: '中金300全收益'
	},
	{
		url: 'https://www.csindex.com.cn/#/indices/family/detail?indexCode=931052',
		matchName: '国信价值全收益'
	},
	{
		url: 'https://www.csindex.com.cn/#/indices/family/detail?indexCode=000922',
		matchName: '中红收益'
	},
	{
		url: 'https://www.csindex.com.cn/#/indices/family/detail?indexCode=H30269',
		matchName: '红利低波全收益'
	}
];

let page;

const _wait = async (func, baseGap = 100) => {
	return new Promise(resolve => {
		setTimeout(async () => {
			resolve(await func());
		}, baseGap + 500 * Math.random());
	});
};

const jumpToStartDate = async (startY, startM, startD) => {
	const panelContainer = await page.$('.ivu-picker-panel-content-left');
	const preStartY = await panelContainer.$('.ivu-date-picker-prev-btn-arrow-double');
	const preStartM = await panelContainer.$('.ivu-date-picker-prev-btn-arrow');
	const nextStartY = await panelContainer.$('.ivu-date-picker-next-btn-arrow-double');
	const nextStartM = await panelContainer.$('.ivu-date-picker-next-btn-arrow');

	const now = new Date();
	const nowY = now.getFullYear();
	const nowM = now.getMonth() + 1;

	for (let i = nowY; i > startY; i--) {
		await _wait(() => preStartY.click());
	}
	for (let j = nowM; j > startM; j--) {
		await _wait(() => preStartM.click());
	}

	const daysContainer = await panelContainer.$('.ivu-date-picker-cells');
	const dayEles = await daysContainer.$$('span.ivu-date-picker-cells-cell');
	const textContents = await Promise.all(
		dayEles.map(async datEle => {
			const text = await datEle.getProperty('textContent');
			const textContent = await text.jsonValue();
			return textContent;
		})
	);
	const index = textContents.findIndex(t => t == startD);
	dayEles[index].click();
};

const jumpToEndDate = async () => {
	const panelContainer = await page.$('.ivu-picker-panel-content-right');
	const preStartY = await panelContainer.$('.ivu-date-picker-prev-btn-arrow-double');
	const preStartM = await panelContainer.$('.ivu-date-picker-prev-btn-arrow');
	const nextStartY = await panelContainer.$('.ivu-date-picker-next-btn-arrow-double');
	const nextStartM = await panelContainer.$('.ivu-date-picker-next-btn-arrow');

	await preStartM.click();
	const daysContainer = await panelContainer.$('.ivu-date-picker-cells');
	const dayEles = await daysContainer.$$('span.ivu-date-picker-cells-cell');
	const classNames = await Promise.all(
		dayEles.map(async datEle => {
			const c = await datEle.getProperty('className');
			const cname = await c.jsonValue();
			return cname;
		})
	);
	let lastIndex;
	classNames.forEach((t, index) => {
		if (
			!t.includes('ivu-date-picker-cells-cell-disabled') &&
			!t.includes('ivu-date-picker-cells-cell-prev-month')
		) {
			lastIndex = index;
		}
	});
	if (Number(lastIndex) !== NaN) {
		dayEles[lastIndex].click();
	}
};

const selectYear = async () => {
	const elements = await page.$$('.date-item');
	if (elements.length >= 5) {
		await elements[1].click();
	} else {
		console.error('无法选中时期');
	}
};

const exportData = async () => {
	const panelContainer = await page.$('.compare-indices-opt');
	const btns = await panelContainer.$$('.ivu-btn');
	await btns[1].click();
};

const removeBlock = async () => {
	if (await page.$('#waf_nc_block')) {
		await page.$eval('#waf_nc_block', el => el.remove());
	}
};

const selectAllProfit = async (matchName) => {
	if (!matchName) {
		return;
	}
	const ele = await page.$('.ivu-select-placeholder');
	await ele.click();
	const options = await page.$$('.ivu-select-item');
	if (options.length > 0) {
		for await (let op of options) {
			const textContent = (await op.evaluate(node => node.textContent)).trim();
			if (matchName == textContent) {
				console.log(textContent);
				await op.click();
			}
		}
	}
};

const openPages = async (url, matchName) => {
	await page.goto(url);
	await _wait(removeBlock, 1000);
	await _wait(() => selectAllProfit(matchName), 1000);
	await _wait(selectYear, 1000);
	await _wait(exportData, 1000);
};

const setDownloadPath = async () => {
	const downloadPath = path.join(__dirname, '../cache/downloadingFiles');
	const customChrome = path.resolve(__dirname, '../../customChrome');
	const customPreference = customChrome + '/Default/Preferences';
	const prefs = fs.readFileSync(customPreference);
	const obj = JSON.parse(prefs);
	obj.savefile = obj.savefile || {};
	obj.savefile.default_directory = downloadPath;
	obj.download = obj.download || {};
	obj.download.default_directory = downloadPath;
	fs.writeFileSync(customPreference, JSON.stringify(obj));
};

const renameDownloadedFiles = async () => {
	const downloadPath = path.join(__dirname, '../cache/downloadingFiles');
	const excelPath = path.join(__dirname, '../cache/excelFiles');
	const files = fs.readdirSync(downloadPath);
	files.forEach(fileName => {
		const fundId = fileName.match(/^(H?\d+)perf.*/)[1];
		const dateNow = formatDate(new Date());
		const newFileName = fundId + '+' + dateNow + '.xlsx';
		const originPath = downloadPath + '/' + fileName;
		const targetPath = excelPath + '/' + newFileName;
		if (fs.existsSync(targetPath)) {
			fs.unlinkSync(targetPath);
		}
		fs.renameSync(originPath, targetPath);
	});
};

(async () => {
	await setDownloadPath();
	const customChrome = path.resolve(__dirname, '../../customChrome');
	const browser = await puppeteer.launch({
		userDataDir: customChrome,
		headless: false,
		args: [
			'--window-size=1920,1080',
			'--start-maximized',
			'--window-position=50,50',
			'--disable-default-apps',
			'--disk-cache-size=1',
		],
	});
	page = await browser.newPage();
	await page.setViewport({
		width: 1920,
		height: 1080,
		deviceScaleFactor: 1,
	});
	for await (let link of links) {
		await _wait(() => openPages(link.url, link.matchName), 5000);
	}
	await _wait(async () => {
		renameDownloadedFiles();
		await browser.close();
	}, 10000);
})();
