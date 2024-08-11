const puppeteer = require('puppeteer');
let page;


const _sync = async (func) => {
  return new Promise(resolve => {
    setTimeout(async () => {
      resolve(await func());
    })
  }, 100 + 100 * Math.random());
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
    await _sync(() => preStartY.click());
  }
  for (let j = nowM; j > startM; j--) {
    await _sync(() => preStartM.click());
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

const exportData = async () => {
  const panelContainer = await page.$('.compare-indices-opt');
  const btns = await panelContainer.$$('.ivu-btn');
  await btns[1].click();
};

(async () => {
  const downloadPath = '\\excels';
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--window-size=1920,1080', // 设置浏览器窗口的宽度和高度
      '--start-maximized',       // 启动时最大化窗口
      '--window-position=100,100', // 设置窗口的初始位置
      '--download-path=' + downloadPath, // 设置下载路径
      '--disable-default-apps', // 禁用默认应用
      '--disk-cache-size=1', // 设置较小的磁盘缓存，避免下载文件被缓存
    ],
  });
  page = await browser.newPage();
  await page.setViewport({
    width: 1920,  // 设置宽度为1920像素
    height: 1080, // 设置高度为1080像素
    deviceScaleFactor: 1, // 缩放比例，1表示100%
  });
  await page.goto('https://www.csindex.com.cn/#/indices/family/detail?indexCode=H30269');

  const dateEle = await page.$('.ivu-date-picker-rel');
  await dateEle.click();

  await jumpToStartDate(2014, 1, 2);
  await jumpToEndDate();
  await exportData();

  // await page.screenshot({path: 'example.png'});
  // await browser.close();
})();