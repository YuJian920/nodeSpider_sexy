const axios = require("axios");
const cheerio = require("cheerio");
const saveImages = require("../utils/saveImages2");

const request = axios.create({
  methods: "GET",
  timeout: 20 * 1000,
  headers: {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-encoding": "gzip, deflate",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    dnt: "1",
    Host: "jigadori.fkoji.com",
    referer: "https://jigadori.fkoji.com/",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36 Edg/102.0.1245.33",
  },
  // proxy: {
  //   host: "127.0.0.1",
  //   port: "0000",
  // },
});

let CURRY_PAGENUMBER = 1; // 爬取起始页码

const spiderQueue = async (soureUrl) => {
  const requestQueue = [];
  let url = soureUrl;

  const res = await request({ url });
  const $ = cheerio.load(res.data);

  $(".photo-link-outer a img").each((i, elem) => {
    requestQueue.push({
      title: i,
      url: $(elem).attr("src"),
    });
  });

  try {
    await saveImages(requestQueue, `Page${CURRY_PAGENUMBER}`, "Jigadori", true);
  } catch (error) {
    console.log("下载时出现错误！");
    console.log(error);
  }

  return $(".go-to-next-page a").attr("href") || "";
};

// 启动队列
const startQueue = async (url) => {
  let nextPage = true;
  while (nextPage) {
    console.log(`开始爬取第${CURRY_PAGENUMBER}页`);
    let nextUrl = `${url}${CURRY_PAGENUMBER === 1 ? "" : nextPage}`;
    nextPage = await spiderQueue(nextUrl);
    console.log(`第${CURRY_PAGENUMBER}页全部抓取完成`);
    CURRY_PAGENUMBER++;
  }
};

startQueue("http://jigadori.fkoji.com/");
