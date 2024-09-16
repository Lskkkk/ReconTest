const path = require("path");
const fs = require("fs");
const puppeteer = require('puppeteer');
const { formatDate } = require("./date");

const links = [
  "https://www.csindex.com.cn/#/indices/family/detail?indexCode=931446", // 东证红利低波
];

let page;

const _wait = async (func, baseGap = 100) => {
  return new Promise(resolve => {
    setTimeout(async () => {
      resolve(await func());
    }, baseGap + 500 * Math.random())
  });
}

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
  const textContents = await Promise.all(dayEles.map(async (datEle) => {
    const text = await datEle.getProperty('textContent');
    const textContent = await text.jsonValue();
    return textContent;
  }));
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
  const classNames = await Promise.all(dayEles.map(async (datEle) => {
    const c = await datEle.getProperty('className');
    const cname = await c.jsonValue();
    return cname;
  }));
  let lastIndex;
  classNames.forEach((t, index) => {
    if (!t.includes('ivu-date-picker-cells-cell-disabled') && !t.includes('ivu-date-picker-cells-cell-prev-month')) {
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
  await page.$eval('#waf_nc_block', el => el.remove());
};

const openPages = async (url) => {
  await page.goto(url);
  await _wait(removeBlock, 1000);
  await _wait(selectYear, 1000);
  await _wait(exportData, 1000);
};

const setDownloadPath = async () => {
  const downloadPath = path.join(__dirname, "../cache/downloadingFiles");
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
  const downloadPath = path.join(__dirname, "../cache/downloadingFiles");
  const excelPath = path.join(__dirname, "../cache/excelFiles");
  const files = fs.readdirSync(downloadPath);
  files.forEach(fileName => {
    const fundId = fileName.match(/^(\d+)perf.*/)[1];
    const dateNow = formatDate(new Date());
    const newFileName = fundId + '+' + dateNow + '.xlsx';
    fs.renameSync(downloadPath + '/' + fileName, excelPath + '/' + newFileName);
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
    ]
  });
  page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });
  await openPages(links[0]);
  await _wait(async () => {
    renameDownloadedFiles();
    await browser.close();
  }, 12000);
})();