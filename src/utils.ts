import * as vscode from 'vscode';
import * as path from 'path';
export function getFullFilePath(relativePath: string): string | undefined {
  // 获取当前打开的工作区文件夹
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (workspaceFolder) {
      // 使用 path.join() 将相对路径连接到工作区文件夹路径
      const fullPath = path.join(workspaceFolder.uri.fsPath, relativePath);
      return fullPath;
  }

  return undefined;
}

