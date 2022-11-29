import download from "download";
import filenamify from "filenamify";
import { ensureDir, readdir } from "fs-extra";
import path from "path";

const downloadDir = "download/";

/**
 * 图片下载函数
 * @param imgList 下载 url 列表
 * @param listName 下载名称
 */
export const saveImages = async (imgList: string[], listName: string) => {
  // 拼接下载路径
  const targetDir = path.resolve(
    process.cwd(),
    downloadDir,
    filenamify(listName)
  );
  let _downloadCount = 0;

  try {
    await ensureDir(targetDir);
    const alreadyPath = await readdir(targetDir);

    for (const item of imgList) {
      try {
        console.log("正在下载 ===>", listName, ++_downloadCount, item);
        const targetFileName =
          item.split("/").pop() || `未命名${_downloadCount}`;
        // 跳过下载已存在文件
        if (alreadyPath.includes(targetFileName)) {
          console.log("跳过已存在 ===>", item);
          continue;
        }
        await download(item, targetDir, { filename: targetFileName });
        // download(item).pipe(
        //   createWriteStream(path.resolve(targetDir, targetFileName))
        // );
      } catch (error) {
        console.log("下载失败 ===>", item);
        continue;
      }
    }
    console.log("下载完成 任务结束");
  } catch (error) {
    console.log("saveVideo: 下载目录创建失败");
  }
};
