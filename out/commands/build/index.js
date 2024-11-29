"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const child_process_1 = require("child_process");
// 获取 package.json 路径并读取内容
function getPackageJson(folderPath) {
    const packageJsonPath = path.join(folderPath, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
        vscode.window.showErrorMessage("未找到 package.json 文件！");
        return null;
    }
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    return packageJson;
}
// 执行 npm 脚本命令
function runNpmCommand(folderPath, script) {
    return new Promise((resolve, reject) => {
        const command = `cd ${folderPath} && npm run ${script}`;
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            console.log(stdout);
            if (error) {
                reject(`执行命令失败: ${error.message}`);
            }
            else if (stderr) {
                reject(`标准错误输出: ${stderr}`);
            }
            else {
                resolve();
            }
        });
    });
}
function activate(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const folderPath = uri.fsPath;
        const packageJson = getPackageJson(folderPath);
        if (!packageJson)
            return;
        const scripts = packageJson.scripts || {};
        const scriptKeys = Object.keys(scripts);
        if (scriptKeys.length === 0) {
            vscode.window.showErrorMessage("package.json 中没有定义 scripts！");
            return;
        }
        const selectedScript = yield vscode.window.showQuickPick(scriptKeys, {
            placeHolder: "选择一个打包命令",
        });
        if (!selectedScript)
            return;
        try {
            // 执行 npm build 命令
            yield runNpmCommand(folderPath, selectedScript);
            console.log(`构建成功：${selectedScript}`);
            vscode.window.showInformationMessage(`构建成功：${selectedScript}`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`构建失败：${error}`);
        }
    });
}
//# sourceMappingURL=index.js.map