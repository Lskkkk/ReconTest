const { exec } = require('child_process');
const path = require("path");

const htmlFilePath = path.join(__dirname, "../../pages/recon.html");

// 使用系统命令打开Chrome浏览器
exec(`start chrome ${htmlFilePath}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`执行的错误: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});