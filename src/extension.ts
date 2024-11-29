import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const PLUGIN_NAME = "auto-builder";

export function activate(context: vscode.ExtensionContext) {
  const commandsDir = path.join(__dirname, "./commands");
  const commandFolders = fs.readdirSync(commandsDir);

  // 循环读取commands目录注册命令
  commandFolders.forEach((folder) => {
    
    const commandPath = path.join(commandsDir, folder, "index.js");

    if (fs.existsSync(commandPath)) {
      import(commandPath)
        .then((commandModule) => {
          if (commandModule.activate) {
            // Register the command with the name defined in the module
            const commandName = `${PLUGIN_NAME}.${folder}`;
            context.subscriptions.push(
              vscode.commands.registerCommand(
                commandName,
                commandModule.activate
              )
            );
            console.log(`Registered command: ${commandName}`);
          }
        })
        .catch((error) => {
          console.error(`Failed to load command from ${commandPath}:`, error);
        });
    }
  });
}

export function deactivate() {}
