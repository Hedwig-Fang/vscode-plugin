import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

function hasSeetingsFile(folderPath: string) {
  // 检查文件夹中是否存在 settings.json 文件
  const settingsFilePath = path.join(folderPath as unknown as string,'.vscode', 'settings.json');
  return fs.existsSync(settingsFilePath);
}
export function findSettingsFile(folderPath: string) {
  if(hasSeetingsFile(folderPath)) {
    return folderPath;
  }
  let currentPath = folderPath;
  while (currentPath) {
    const settingsFilePath = path.join(currentPath, '.vscode', 'settings.json');
    if (fs.existsSync(settingsFilePath)) {
        return settingsFilePath;
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
        // Reached the root directory
        break;
    }

    currentPath = parentPath;
}
return null

}
export function getFullFilePath(relativePath: string): string | undefined {
  // 获取当前打开的工作区文件夹

  if (workspaceFolder) {
      // 使用 path.join() 将相对路径连接到工作区文件夹路径
      const fullPath = path.join(workspaceFolder.uri.fsPath, relativePath);
      return fullPath;
  }

  return undefined;
}

