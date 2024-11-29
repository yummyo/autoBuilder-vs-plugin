# VS Code Auto Builder

## 简介

VS Code Auto Builder 是一个 Visual Studio Code 插件，旨在简化项目的构建和部署过程。通过简单的命令，你可以快速执行 npm 脚本并部署构建结果到远程服务器。

## 功能

- **构建项目**：从 `package.json` 中选择并执行指定的 npm 脚本。
- **部署项目**：将构建结果上传到远程服务器。

## 安装

1. 打开 Visual Studio Code。
2. 进入 Extensions 视图（快捷键：`Ctrl+Shift+X`）。
3. 在搜索框中输入 `vscode-auto-builder`。
4. 点击安装按钮。

## 配置

在 VS Code 的设置中，可以配置以下选项：

- **`auto-builder.localBuildPath`**：本地构建路径。
- **`auto-builder.remoteDeployDir`**：远程部署目录。
- **`auto-builder.serverInfo`**：要部署的服务器信息，包括主机地址、端口、用户名和密码。

### 示例配置

```json
{
  "auto-builder.localBuildPath": "/path/to/local/build",
  "auto-builder.remoteDeployDir": "/path/to/remote/deploy",
  "auto-builder.serverInfo": {
    "host": "192.168.1.100",
    "port": 22,
    "username": "your-username",
    "password": "your-password"
  }
}