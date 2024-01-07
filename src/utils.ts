import axios from "axios";
import fs = require('fs');
import path = require('path');


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
export function getFullFilePath(relativePath: string, fsPath: string): string | undefined {
  // 获取当前打开的工作区文件夹
// const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (fsPath) {
      // 使用 path.join() 将相对路径连接到工作区文件夹路径
      const fullPath = path.join(fsPath, relativePath);
      return fullPath;
  }

  return undefined;
}

export const getIconFontDataDefine = (icons: Record<string, string>[]) => {
	return icons.map((res: Record<string, string>) => {
		const { font_class, show_svg } = res;
		return {
			font_class,
			show_svg
		};
	})

}
export function getIconFontData() {
	return new Promise((resolve) => {
		const headers = {
			'authority': 'www.iconfont.cn',
			'accept': '*/*',
			'accept-language': 'zh-CN,zh;q=0.9',
			'bx-v': '2.5.6',
			'cache-control': 'no-cache',
			'cookie': 'cna=3OzFGvlZ/F4CAWXgfgUi3Knv; locale=zh-cn; ctoken=Gd9lDLHBCnQz0jmgmqy4VUek; EGG_SESS_ICONFONT=dzIFRF6UFHpWicZx2_bPcos_r21OBv4pb31TK4F6HCbBvR4TxImTp1OtvR_G9AOUAy9mzfmEMba4SbPHeooJRgkDczL28RiDRwqEU3GTiBIGNEk7WLfZ_IYr_PYt47bI; u=9383056; u.sig=QVU9UlDGCSup90NCmQCmX8inX1CXTXKbNRgq9b5ImY8; xlly_s=1; tfstk=eMB9jmY2jkn9p5gytRF30a0lUnZ3ZOIwJNSSnEYiGwQdVguMG14NksQR8IDccP5AJN7JnEv_uxKfoNpckirwcE_fkEfgt8jNbKJbrZeuEGovcziYr5rdTWJ2hz4ntxOaeK7-v3U5x5zYaVPmUeWkf7na9NmDi6t96EHDJxEamhO9PGTLPz6LhCL5feHf4IXleu2xrUKm1kEKgjR6YBIva7egFBKJvUqh5jl29b-prkFsgjR6YHLuxplqgBhP.; isg=BBAQ378GQQpamRrx1uHlEynH4Vhi2fQjNuripQriQWujRbfvsumDssU5GQ2llaz7',
			'pragma': 'no-cache',
			'referer': 'https://www.iconfont.cn/manage/index?spm=a313x.manage_index.i1.db775f1f3.690c3a81hiDLwd&manage_type=myprojects&projectId=2052064',
			'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"macOS"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'same-origin',
			'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		};
		const url = 'https://www.iconfont.cn/api/project/detail.json?pid=1888845&t=1704564849417&ctoken=Gd9lDLHBCnQz0jmgmqy4VUek';
		axios.get(url, { headers })
			.then(response => {
				const { icons } = response.data.data;
				resolve(getIconFontDataDefine(icons));
				console.log('响应数据:', response.data);
			})
			.catch(error => {
				console.error('请求出错:', error.message);
			});
	});


}
// 获取文件夹中的所有文件
export function getFilesInDirectory(directoryPath: string): string[] {
	const files = [];
	const entries = fs.readdirSync(directoryPath);

	for (const entry of entries) {
		const entryPath = path.join(directoryPath, entry);
		const stat = fs.statSync(entryPath);

		if (stat.isDirectory()) {
			// 如果是子文件夹，则递归调用
			files.push(...getFilesInDirectory(entryPath));
		} else {
			// 如果是文件，则添加到文件列表
			files.push(entryPath);
		}
	}

	return files;
}

