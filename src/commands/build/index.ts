import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";


// 获取 package.json 路径并读取内容
function getPackageJson(folderPath: string) {
    const packageJsonPath = path.join(folderPath, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      vscode.window.showErrorMessage("未找到 package.json 文件！");
      return null;
    }
  
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    return packageJson;
  }
  
  // 执行 npm 脚本命令
  function runNpmCommand(folderPath: string, script: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = `cd ${folderPath} && npm run ${script}`;
      exec(command, (error, stdout, stderr) => {
        console.log(stdout)
        if (error) {
          reject(`执行命令失败: ${error.message}`);
        } else if (stderr) {
          reject(`标准错误输出: ${stderr}`);
        } else {
          resolve();
        }
      });
    });
  }

export async function activate(uri: vscode.Uri) {
    const folderPath = uri.fsPath;
      const packageJson = getPackageJson(folderPath);
      if (!packageJson) return;

      const scripts = packageJson.scripts || {};
      const scriptKeys = Object.keys(scripts);

      if (scriptKeys.length === 0) {
        vscode.window.showErrorMessage("package.json 中没有定义 scripts！");
        return;
      }

      const selectedScript = await vscode.window.showQuickPick(scriptKeys, {
        placeHolder: "选择一个打包命令",
      });

      if (!selectedScript) return;

      try {
        // 执行 npm build 命令
        await runNpmCommand(folderPath, selectedScript);
        console.log(`构建成功：${selectedScript}`)
        vscode.window.showInformationMessage(`构建成功：${selectedScript}`);
      } catch (error) {
        vscode.window.showErrorMessage(`构建失败：${error}`);
      }
}
