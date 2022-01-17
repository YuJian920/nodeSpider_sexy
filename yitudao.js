const axios = require("axios");
const cheerio = require("cheerio");
const saveImages = require("./utils/saveImages");

const request = axios.create({
  methods: "GET",
  timeout: 20 * 1000,
  headers: {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    dnt: "1",
    "if-modified-since": "Thu, 15 Jan 2022 17:48:09 GMT",
    "if-none-match": "1641491296",
    "sec-ch-ua":
      '" Not A;Brand";v="99", "Chromium";v="96", "Microsoft Edge";v="96"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "Windows",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": 1,
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 Edg/96.0.1054.62",
  },
});

urlArray = [
  "https://www.yitudao.com/meinv/xinggan/",
  "https://www.yitudao.com/meinv/siwameitui/",
  "https://www.yitudao.com/meinv/chemo/",
  "https://www.yitudao.com/meinv/wangluomeinv/",
  "https://www.yitudao.com/meinv/tiyumeinv/",
  "https://www.yitudao.com/meinv/rentiyishu/",
];

let CURRY_PAGENUMBER = 2; // 爬取起始页码
let MAX_PAGENUMBER = 573; // 爬取最大页码

// 爬取队列
const spiderQueue = async (soureUrl) => {
  const url = `${soureUrl}${CURRY_PAGENUMBER}.html`;
  request({ url }).then(async (res) => {
    const $ = cheerio.load(res.data);

    const requestQueue = [];
    $("a[title]").each((i, elem) => {
      requestQueue.push({
        title: $(elem).attr("title"),
        url: $(elem).attr("href"),
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
    CURRY_PAGENUMBER++;
    if (CURRY_PAGENUMBER <= MAX_PAGENUMBER) spiderQueue(soureUrl);
  });
};

// 加载 HTML
const loadHtml = async (url, title) => {
  try {
    const { data } = await request({ url });
    const $ = cheerio.load(data);
    const soureURL = url.substring(0, url.length - 5);

    const forNum = +$("#title .imageset-sum").html().slice(2);

    const loadQueue = [];
    for (let index = 1; index <= forNum; index++) {
      if (index === 1) {
        const imageUrl = await loadImages(`${soureURL}.html`);
        loadQueue.push(imageUrl);
        continue;
      }
      const imageUrl = await loadImages(`${soureURL}_${index}.html`);
      loadQueue.push(imageUrl);
    }

    await saveImages({ [title]: loadQueue }, forNum);
  } catch (error) {
    console.log(`loadHtml: 下载${title}时出现错误！`);
    console.log(error);
  }
};

// 获取图片 URL
const loadImages = async (url) => {
  try {
    const resultHtml = await request({ url });
    const $ = cheerio.load(resultHtml.data);
    return $(".img_box a img").attr("src");
  } catch (error) {
    console.log(`loadImages: 下载${url}时出现错误！`);
    console.log(error);
  }
};

spiderQueue(urlArray[0]);