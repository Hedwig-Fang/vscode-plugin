import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';


function hasSeetingsFile(folderPath: string) {
  // 检查文件夹中是否存在 settings.json 文件
  const settingsFilePath = path.join(folderPath as unknown as string,'.vscode', 'settings.json');
  return fs.existsSync(settingsFilePath);
}
export function findSettingsFile(folderPath: string) {
  if(hasSeetingsFile(folderPath)) {
    return {
      folder: folderPath,
      // url: path.join(folderPath as unknown as string, 'hwplugin.json')
      url: path.join(folderPath as unknown as string,'.vscode', 'settings.json')

    };
  }
  let currentPath = folderPath;
  while (currentPath) {
    // const settingsFilePath = path.join(currentPath, 'hwplugin.json');
    const settingsFilePath = path.join(currentPath, '.vscode', 'settings.json');

    if (fs.existsSync(settingsFilePath)) {
        return  {
          folder: currentPath,
          url:settingsFilePath
        };
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
        // Reached the root directory
        break;
    }

    currentPath = parentPath;
}
return {
  folder: undefined,
  url: undefined
}

}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFullFilePath(relativePath: string, fsPath: any): string | undefined {
  // 获取当前打开的工作区文件夹
// const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (fsPath) {
      // 使用 path.join() 将相对路径连接到工作区文件夹路径
      const fullPath = path.join(fsPath, relativePath);
      return fullPath;
  }

  return undefined;
}

