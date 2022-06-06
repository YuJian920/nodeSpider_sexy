const axios = require("axios");
const cheerio = require("cheerio");
const saveImages = require("../utils/saveImages2");

const request = axios.create({
  methods: "GET",
  timeout: 20 * 1000,
  headers: {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    dnt: "1",
    referer: "https://www.kanxiaojiejie.com/",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36 Edg/102.0.1245.30",
  },
});

let CURRY_PAGENUMBER = 1; // 爬取起始页码
let MAX_PAGENUMBER = 127; // 爬取最大页码

/**
 * 爬取队列
 * @param {*} soureUrl
 */
const spiderQueue = async (soureUrl) => {
  const requestQueue = [];
  let url = "";

  // 针对第一页特殊处理
  if (CURRY_PAGENUMBER === 1) url = soureUrl;
  else url = `${soureUrl}/page/${CURRY_PAGENUMBER}`;

  const res = await request({ url });
  const $ = cheerio.load(res.data);
  // 获取图片 url 推入请求队列
  $(".entry-thumbnail img").each((i, elem) => {
    requestQueue.push({
      title: $(elem).attr("title"),
      url: $(elem).attr("src"),
    });
  });

  // 下载请求队列中的图片
  try {
    await saveImages(requestQueue, `Page${CURRY_PAGENUMBER}`, "Kanxiaojiejie");
  } catch (error) {
    console.log("下载时出现错误！");
    console.log(error);
  }
};

// 启动队列
const startQueue = async () => {
  for (
    CURRY_PAGENUMBER;
    CURRY_PAGENUMBER <= MAX_PAGENUMBER;
    CURRY_PAGENUMBER++
  ) {
    console.log(`开始爬取第${CURRY_PAGENUMBER}页`);
    await spiderQueue("https://www.kanxiaojiejie.com");
    console.log(`第${CURRY_PAGENUMBER}页全部抓取完成`);
  }
};

startQueue();
