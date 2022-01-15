const axios = require("axios");
const fs = require("fs");

/**
 * 图片下载
 * @param {*} imgObject 图片 URL
 */
async function saveImages(imgObject) {
  try {
    const forItem = Object.keys(imgObject);
    for (let forItemIndex = 0; forItemIndex < forItem.length; forItemIndex++) {
      const imTitle = forItem[forItemIndex]; // 文件名
      for (let urlIndex = 0; urlIndex < imgObject[imTitle].length; urlIndex++) {
        const eachItem = imgObject[forItem][urlIndex]; // url
        console.log("正在下载 ===>", imTitle, urlIndex + 1, eachItem);

        const filename = eachItem.split("/").pop();
        const { data } = await axios({
          url: eachItem,
          responseType: "arraybuffer",
        });
        fs.access(`./Result/${imTitle}`, (accessErr) => {
          if (accessErr) {
            fs.mkdir(`./Result/${imTitle}`, (mkdirErr) => {
              if (mkdirErr) console.log("目录创建失败");
            });
          } else {
            fs.writeFileSync(`./Result/${imTitle}/${filename}`, data, "binary");
          }
        });
      }
    }
  } catch (error) {
    console.log(`saveImages: 下载图片时出现错误！`);
    console.log(error);
  }
}

module.exports = saveImages;
