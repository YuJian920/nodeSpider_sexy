const axios = require("axios");
const fs = require("fs");

/**
 * 图片下载
 * @param {*} imgObject 图片 URL
 */
function saveImages(imgObject) {
  return new Promise((resolve, reject) => {
    const forItem = Object.keys(imgObject);
    for (let forItemIndex = 0; forItemIndex < forItem.length; forItemIndex++) {
      const imTitle = forItem[forItemIndex]; // 文件名
      fs.access(`./Result/${imTitle}`, async (accessErr) => {
        if (accessErr) fs.mkdirSync(`./Result/${imTitle}`);
        else {
          const alreadyPath = fs.readdirSync(`./Result/${imTitle}`);
          // 已有文件跳过
          if (alreadyPath.length === imgObject[imTitle].length) {
            console.log(`${imTitle} 已存在 跳过抓取`);
            resolve()
            return;
          }
        }
        for (let urlIndex = 0; urlIndex < imgObject[imTitle].length; urlIndex++) {
          const eachItem = imgObject[forItem][urlIndex]; // url
          if (!eachItem) continue;
          console.log("正在下载 ===>", imTitle, urlIndex + 1, eachItem);
          try {
            const filename = eachItem.split("/").pop();
            const { data } = await axios({
              url: eachItem,
              responseType: "arraybuffer",
            });
            fs.writeFileSync(`./Result/${imTitle}/${filename}`, data, "binary");
          } catch (error) {
            console.log(`saveImages: 下载图片时出现错误！`);
            console.log(error);
          }
        }
        resolve();
      });
    }
  })
}

module.exports = saveImages;
