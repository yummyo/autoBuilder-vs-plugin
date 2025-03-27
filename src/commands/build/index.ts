import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { outputChannel } from "../../extension";

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
    outputChannel.appendLine(`开始执行命令: ${command}`);

    exec(command, (error, stdout, stderr) => {
      // 将输出添加到面板
      if (stdout) {
        outputChannel.appendLine(stdout);
      }
      if (stderr) {
        outputChannel.appendLine(`警告: ${stderr}`);
      }

      if (error) {
        outputChannel.appendLine(`错误: ${error.message}`);
        reject(`执行命令失败: ${error.message}`);
      } else {
        outputChannel.appendLine("命令执行成功！");
        resolve();
      }
    });
  });
}

export async function activate(uri: vscode.Uri) {
  // 显示输出面板
  outputChannel.show(false); // true 表示不强制获取焦点

  // 添加提示信息
  vscode.window.showInformationMessage("请在底部输出面板查看构建进度");

  const folderPath = uri.fsPath;
  outputChannel.appendLine(
    `\n[${new Date().toLocaleString()}] 开始处理项目: ${folderPath}`
  );

  const packageJson = getPackageJson(folderPath);
  if (!packageJson) {
    outputChannel.appendLine("未找到 package.json 文件！");
    return;
  }

  const scripts = packageJson.scripts || {};
  const scriptKeys = Object.keys(scripts);

  if (scriptKeys.length === 0) {
    outputChannel.appendLine("package.json 中没有定义 scripts！");
    vscode.window.showErrorMessage("package.json 中没有定义 scripts！");
    return;
  }

  const selectedScript = await vscode.window.showQuickPick(scriptKeys, {
    placeHolder: "选择一个打包命令"
  });

  if (!selectedScript) {
    outputChannel.appendLine("用户取消了操作");
    return;
  }

  try {
    outputChannel.appendLine(`\n开始执行打包命令: ${selectedScript}`);
    await runNpmCommand(folderPath, selectedScript);
    outputChannel.appendLine(`\n✅ 构建成功：${selectedScript}`);
    vscode.window.showInformationMessage(`构建成功：${selectedScript}`);
  } catch (error) {
    outputChannel.appendLine(`\n❌ 构建失败：${error}`);
    vscode.window.showErrorMessage(`构建失败：${error}`);
  }
}
