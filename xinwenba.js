/**
 * 这个js可能不能正常工作，因为在测试的时候遇到了网站的反爬
 */

const axios = require("axios");
const cheerio = require("cheerio");
const saveImages = require("./utils/saveImages");

const request = axios.create({
  methods: "GET",
  timeout: 20 * 1000,
  headers: {
    "content-type": "text/html; charset=utf-8",
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "zh-CN,zh;q=0.9",
    "cache-control": "no-cache",
    pragma: "no-cache",
    referer: "https://www.xinwenba.net/web/meinv/",
    "sec-ch-ua":
      '" Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "Windows",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": 1,
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
  },
});

let CURRY_PAGENUMBER = 1; // 爬取起始页码
let MAX_PAGENUMBER = 15; // 爬取最大页码

const spiderQueue = async (soureUrl) => {
  const url = `${soureUrl.slice(0, 41)}${CURRY_PAGENUMBER}.html`;
  request({ url }).then(async ({ data }) => {
    const $ = cheerio.load(data);

    const requestQueue = [];
    $(".list_image a[class]").each((i, elem) => {
      requestQueue.push({
        title: $(elem).html(),
        url: `https://www.xinwenba.net${$(elem).attr("href")}`,
      });
    });

    for (let index = 0; index < requestQueue.length; index++) {
      console.log(
        `正在抓取第${CURRY_PAGENUMBER}页 ==>`,
        requestQueue[index].title,
        requestQueue[index].url
      );
      await loadHtml(requestQueue[index].url, requestQueue[index].title);
    }

    console.log(`第${CURRY_PAGENUMBER}页全部抓取完成`);
  });
};

// 加载 HTML
const loadHtml = async (url, title) => {
  try {
    const { data } = await request({ url });
    const $ = cheerio.load(data);
    const soureURL = url.substring(0, 41);

    const forNum = $(".paging a").length - 3;

    const loadQueue = [];
    for (let index = 1; index <= forNum; index++) {
      const imageUrl = await loadImages(`${soureURL}-${index}.html`);
      loadQueue.push(...imageUrl);
    }

    await saveImages({ [title]: loadQueue }, loadQueue.length, "Cos");
  } catch (error) {
    console.log(`loadHtml: 下载${title}时出现错误！`);
    // console.log(error);
  }
};

const loadImages = async (url) => {
  try {
    const resultHtml = await request({ url });
    const $ = cheerio.load(resultHtml.data);
    const imagesQueue = [];
    $(".picture p img").each((i, elem) => {
      imagesQueue.push($(elem).attr("src"));
    });
    return imagesQueue;
  } catch (error) {
    console.log(`loadImages: 下载${url}时出现错误！`);
    // console.log(error);
  }
};

const startQueue = async () => {
  for (CURRY_PAGENUMBER; CURRY_PAGENUMBER < MAX_PAGENUMBER; CURRY_PAGENUMBER++) {
    await spiderQueue("https://www.xinwenba.net/plus/list-20020-1.html");
  }
};

startQueue();