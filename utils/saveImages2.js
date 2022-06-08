const axios = require("axios");
const fs = require("fs");

const request = axios.create({
  methods: "GET",
  timeout: 20 * 1000,
  headers: {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36 Edg/102.0.1245.33",
  },
  // proxy: {
  //   host: "127.0.0.1",
  //   port: "0000",
  // },
});

/**
 *
 * @param {*} imgList 图片 url 数组
 * @param {*} listName 下载文件的分类文件夹路径名称，改路径不存在会自动创建
 * @param {*} path 下载文件夹路径，改参数的文件夹必须存在，否则会抛出异常
 * @param {*} strict 严格模式，严格模式下会对比图片文件名来判断是否已经下载过
 * @returns
 */
function saveImages2(imgList, listName, path = "Result", strict = false) {
  return new Promise((resolve, reject) => {
    fs.access(`../Result/${path}/${listName}`, async (accessErr) => {
      if (accessErr) fs.mkdirSync(`../Result/${path}/${listName}`);
      else {
        const alreadyPath = fs.readdirSync(`../Result/${path}/${listName}`);
        // 已有文件跳过
        if (alreadyPath.length === imgList.length) {
          console.log(`${listName} 已存在 跳过抓取`);
          resolve();
          return;
        }
      }

      for (let urlIndex = 0; urlIndex < imgList.length; urlIndex++) {
        const eachItem = imgList[urlIndex]?.url || imgList[urlIndex];
        console.log("正在下载 ===>", listName, urlIndex + 1, eachItem);

        const filename = eachItem.split("/").pop();

        if (strict) {
          const alreadyPath = fs.readdirSync(`../Result/${path}/${listName}`);

          if (alreadyPath.includes(filename)) {
            console.log(`${filename} 已存在 跳过抓取`);
            continue;
          }
        }

        try {
          const { data } = await request({
            url: eachItem,
            responseType: "arraybuffer",
          });
          fs.writeFileSync(
            `../Result/${path}/${listName}/${filename}`,
            data,
            "binary"
          );
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
