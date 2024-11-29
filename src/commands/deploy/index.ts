import * as vscode from "vscode";
import * as path from "path";
const { NodeSSH } = require("node-ssh");

function validateRemoteDir(ssh, remoteDeployDir) {
  return ssh
    .execCommand(
      `test -d ${remoteDeployDir} && echo "exists" || echo "not exists"`
    )
    .then(async (result) => {
      if (result.stderr) {
        throw new Error(`检查目录失败: ${result.stderr}`);
      }

      if (result.stdout.trim() === "not exists") {
        // 目录不存在，提示用户是否创建
        const choice = await vscode.window.showInformationMessage(
          `目录 ${remoteDeployDir} 不存在，是否创建？`,
          { modal: true },
          "创建",
        );

        if (choice === "创建") {
          // 创建目录
          return ssh
            .execCommand(`mkdir -p ${remoteDeployDir}`)
            .then((mkdirResult) => {
              if (mkdirResult.stderr) {
                throw new Error(`创建目录失败: ${mkdirResult.stderr}`);
              }
              console.log(`目录 ${remoteDeployDir} 创建成功`);
            });
        } else {
          throw new Error("用户选择不创建目录，备份操作终止");
        }
      }
    });
}
// 备份远程服务器文件
function backupRemoteFiles(ssh, remoteDeployDir) {
  const backupFileName = `bak_building_${new Date()
    .toLocaleString()
    .replace(/[/\s:]/g, "")}_autoUpload`; // 生成带时间戳的备份文件名
  // 检查目录是否有除以 bak 和 dist 开头的文件
  const checkCommand = `cd ${remoteDeployDir} && find . -maxdepth 1 -type f ! -name 'bak*' ! -name 'dist*' | grep .`;

  return ssh
    .execCommand(checkCommand)
    .then((checkResult) => {
      if (checkResult.stderr) {
        throw new Error(`检查目录失败: ${checkResult.stderr}`);
      }

      // 如果目录没有符合条件的文件，则返回
      if (checkResult.stdout.trim() === "") {
        console.log("目录为空，跳过备份。");
        return; // 退出函数
      }

      // 备份文件 忽略bak和dist开头的文件
      const backupCommand = `cd ${remoteDeployDir} && tar --exclude='bak*' --exclude='dist*' -czf "${backupFileName}.tar.gz" ./*`;
      return ssh.execCommand(backupCommand);
    })
    .then((result) => {
      if (result && result.stderr) {
        throw new Error(`备份失败: ${result.stderr}`);
      }
      console.log(`备份成功，备份文件名: ${backupFileName}`);
    });
}

// 上传打包文件到服务器
function uploadFiles(ssh, remoteDeployDir, localBuildPath) {
  return ssh
    .putDirectory(localBuildPath, remoteDeployDir, {
      recursive: true,
      concurrency: 10,
      validate: function (itemPath) {
        const baseName = path.basename(itemPath);
        return baseName !== "node_modules" && baseName[0] !== "."; // 忽略不必要的文件
      },
      tick: function (localPath, remoteDeployDir, error) {
        if (error) {
          console.error(`上传失败: ${localPath}`);
        } else {
          console.log(`上传成功: ${localPath}`);
        }
      },
    })
    .then(() => {
      console.log(`所有文件上传成功`);
    })
    .catch((err) => {
      console.error(`上传失败: ${err.message}`);
    });
}

// 连接到服务器
const linkServer = (ssh, serverInfo) => {
  return ssh
    .connect(serverInfo)
    .then(() => {
      console.log("连接服务器成功...");
    })
    .catch(() => {
      console.log("连接服务器失败...");
    });
};

export async function activate(uri: vscode.Uri) {
  const config = vscode.workspace.getConfiguration("auto-builder");
  const localBuildPath = config.get<string>("localBuildPath");
  const remoteDeployDir = config.get<string>("remoteDeployDir");
  const serverInfo = config.get<any>("serverInfo");

  if (
    !localBuildPath ||
    !remoteDeployDir ||
    !serverInfo.host ||
    !serverInfo.username ||
    !serverInfo.password
  ) {
    vscode.window.showErrorMessage("请检查setting.json配置是否完整！");
    return;
  }

  const ssh = new NodeSSH();

  try {
    // 链接服务器
    await linkServer(ssh, serverInfo);
    // 校验远程目录是否存在
    await validateRemoteDir(ssh, remoteDeployDir);
    // 备份远程服务器文件
    await backupRemoteFiles(ssh, remoteDeployDir);
    // 部署到远程服务器
    await uploadFiles(ssh, remoteDeployDir, localBuildPath);

    vscode.window.showInformationMessage("部署成功！");
  } catch (error) {
    vscode.window.showErrorMessage(`部署失败：${error}`);
  }
}
