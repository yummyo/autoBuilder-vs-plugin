import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const PLUGIN_NAME = "auto-builder";

export function activate(context: vscode.ExtensionContext) {
  // const commandsDir = path.join(__dirname, "./commands");
  const outputChannel = vscode.window.createOutputChannel("auto-builder", {
    log: true
  });
  context.subscriptions.push(outputChannel);

  outputChannel.show(true);
  outputChannel.appendLine("插件初始化成功");
  // 插件激活代码中增加状态栏入口
  vscode.commands.registerCommand("auto-builder.showOutput", () => {
    outputChannel.show(true);
  });

  const btn = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );
  btn.text = "$(output) 构建日志";
  btn.command = "auto-builder.showOutput";
  btn.show();
}

export function deactivate() {
  // 清理输出面板
  outputChannel.dispose();
}
