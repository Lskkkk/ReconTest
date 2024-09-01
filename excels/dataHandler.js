const ExcelJS = require('exceljs/dist/es5');
const fs = require('fs');
const path = require('path');
const fileDir = path.join(__dirname, 'excelFiles');
const dataDir = path.join(__dirname, 'handledData');

const main = async () => {
    const allData = {};

    // 读取files中的excel
    const files = fs.readdirSync(fileDir);
    const allPros = files.map(fileName => {
        const workbook = new ExcelJS.Workbook();
        return workbook.xlsx.readFile(path.join(fileDir, fileName)).then(() => {
            const worksheet = workbook.getWorksheet(1);
            worksheet.eachRow((row, rowNumber) => {
                const [, day, , cnName, , , , , , , value] = row.values;
                if (cnName.includes('指数中文全称')) return;
                if (!allData[cnName]) {
                    allData[cnName] = {};
                }
                allData[cnName][day] = Number(value);
            });
        });
    });
    await Promise.all(allPros);

    // 写入json到data目录
    const jsonContent = JSON.stringify(allData, null, 2);
    const jsContent = `const allFunds = ${jsonContent};`;
    const filePath = path.join(dataDir, 'all.js');
    const fileJsonPath = path.join(dataDir, 'all.json');
    if (fs.existsSync(filePath)) {
        const originalData = JSON.parse(fs.readFileSync(fileJsonPath, 'utf8'));
        const oLength = Object.values(originalData).map(d => Object.values(d).length).join(',');
        const cLength = Object.values(allData).map(d => Object.values(d).length).join(',');
        if (oLength == cLength && oLength != '') {
            console.log('无需更新', oLength, '==', cLength)
            return;
        }
    }
    fs.writeFileSync(filePath, jsContent, 'utf8');
    fs.writeFileSync(fileJsonPath, jsonContent, 'utf8');
    console.log(' 更新完成!');
};

main();