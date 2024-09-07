const ExcelJS = require("exceljs/dist/es5");
const fs = require("fs");
const path = require("path");

const { formatDate } = require("./date");

const fileDir = path.join(__dirname, "../cache/excelFiles");
const dataDir = path.join(__dirname, "../cache/handledData");
const fileJsonPath = path.join(dataDir, "all.json");
const guiCachePath = path.join(dataDir, "gui.json");
const LAST_REQUEST = "LAST_REQUEST";

const init = async () => {
  const allData = {};

  // 读取files中的excel
  const files = fs.readdirSync(fileDir);
  const allPros = files.map((fileName) => {
    const workbook = new ExcelJS.Workbook();
    return workbook.xlsx.readFile(path.join(fileDir, fileName)).then(() => {
      const worksheet = workbook.getWorksheet(1);
      worksheet.eachRow((row, rowNumber) => {
        const [, day, , cnName, , , , , , , value] = row.values;
        if (cnName.includes("指数中文全称")) return;
        if (!allData[cnName]) {
          allData[cnName] = {};
        }
        allData[cnName][day] = Number(value);
      });
    });
  });
  await Promise.all(allPros);

  updateCache(allData);
};

const getCache = (id) => {
  let originalData = {};
  try {
    originalData = JSON.parse(fs.readFileSync(fileJsonPath, "utf8"));
  } catch (error) {
    console.log(error);
  }
  if (originalData[id]) {
    const lastRequest = originalData[LAST_REQUEST];
    if (
      lastRequest &&
      lastRequest[id] &&
      lastRequest[id] == formatDate(new Date())
    ) {
      console.log(id, "use cache, last update time: ", lastRequest[id]);
      return originalData[id];
    }
  }
  console.log(id, "no cache to use");
  return [];
};

const updateCache = async (jsonData) => {
  if (!fs.existsSync(fileJsonPath)) {
    throw new Error(fileJsonPath + "不存在");
  }
  let originalData = {};
  try {
    originalData = JSON.parse(fs.readFileSync(fileJsonPath, "utf8"));
  } catch (error) {
    console.log(error);
  }
  const lastRequest = originalData[LAST_REQUEST] || {};
  Object.keys(jsonData).forEach((fundId) => {
    if (fundId == LAST_REQUEST) {
      return;
    }
    if (!originalData[fundId]) {
      originalData[fundId] = jsonData[fundId];
      return;
    }
    if (
      Object.values(originalData[fundId]).length <
      Object.values(jsonData[fundId]).length
    ) {
      originalData[fundId] = jsonData[fundId];
      return;
    }
    console.log(fundId, "cache the same");
    lastRequest[fundId] = formatDate(new Date());
  });
  originalData[LAST_REQUEST] = lastRequest;
  const jsonContent = JSON.stringify(originalData, null, 2);
  fs.writeFileSync(fileJsonPath, jsonContent, "utf8");
};

const getGuiCache = () => {
  return fs.readFileSync(guiCachePath, "utf8");
};
const setGuiCache = (str) => {
  fs.writeFileSync(guiCachePath, str, "utf8");
};

init();

module.exports = {
  LAST_REQUEST,
  getCache,
  updateCache,
  getGuiCache,
  setGuiCache,
};
