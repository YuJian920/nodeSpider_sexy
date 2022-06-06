const axios = require("axios");
const fs = require("fs");

function saveImages2(imgList, listName, path = "Result") {
  return new Promise((resolve, reject) => {
    fs.access(`./${path}/${listName}`, async (accessErr) => {
      if (accessErr) fs.mkdirSync(`./${path}/${listName}`);
      else {
        const alreadyPath = fs.readdirSync(`./${path}/${listName}`);
        // 已有文件跳过
        if (alreadyPath.length === imgList.length) {
          console.log(`${listName} 已存在 跳过抓取`);
          resolve();
          return;
        }
      }

      for (let urlIndex = 0; urlIndex < imgList.length; urlIndex++) {
        const eachItem = imgList[urlIndex].url;
        console.log("正在下载 ===>", listName, urlIndex + 1, eachItem);

        try {
          const filename = eachItem.split("/").pop();
          const { data } = await axios({
            url: eachItem,
            responseType: "arraybuffer",
          });
          fs.writeFileSync(`./${path}/${listName}/${filename}`, data, "binary");
        } catch (error) {
          console.log(`saveImages: 下载图片时出现错误！`);
          console.log(error);
        }
      }
      resolve();
    });
  });
}

module.exports = saveImages2;
