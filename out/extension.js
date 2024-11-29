"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const PLUGIN_NAME = "auto-builder";
function activate(context) {
    const commandsDir = path.join(__dirname, "./commands");
    const commandFolders = fs.readdirSync(commandsDir);
    // 循环读取commands目录注册命令
    commandFolders.forEach((folder) => {
        const commandPath = path.join(commandsDir, folder, "index.js");
        if (fs.existsSync(commandPath)) {
            Promise.resolve(`${commandPath}`).then(s => require(s)).then((commandModule) => {
                if (commandModule.activate) {
                    // Register the command with the name defined in the module
                    const commandName = `${PLUGIN_NAME}.${folder}`;
                    context.subscriptions.push(vscode.commands.registerCommand(commandName, commandModule.activate));
                    console.log(`Registered command: ${commandName}`);
                }
            })
                .catch((error) => {
                console.error(`Failed to load command from ${commandPath}:`, error);
            });
        }
    });
}
function deactivate() { }
//# sourceMappingURL=extension.js.map