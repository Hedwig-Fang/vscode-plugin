"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
function activate(context) {
    console.log('Congratulations, your extension "vscode-plugin-demo" is now active!');
    let disposable = vscode.commands.registerCommand('vscode-plugin-demo.helloWorld', () => {
        const currentMainPath = vscode.workspace.workspaceFolders?.map(res => res.uri.path)[0];
        const currentstylePath = `${currentMainPath}/src/hw-design-vue/lib/style/hwThemesDefault`;
        vscode.window
            .showOpenDialog({
            // 可选对象
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            defaultUri: vscode.Uri.file(currentstylePath),
            openLabel: "选择默认样式入口文件",
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map