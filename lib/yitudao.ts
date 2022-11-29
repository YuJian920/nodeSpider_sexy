import * as cheerio from "cheerio";
import { request } from "../utils/request";
import { saveImages } from "../utils/saveImages";

const urlArray = [
  "https://www.yitudao.com/meinv/xinggan/",
  "https://www.yitudao.com/meinv/siwameitui/",
  "https://www.yitudao.com/meinv/chemo/",
  "https://www.yitudao.com/meinv/wangluomeinv/",
  "https://www.yitudao.com/meinv/tiyumeinv/",
  "https://www.yitudao.com/meinv/rentiyishu/",
];

let CURRY_PAGENUMBER = 1; // 爬取起始页码
let MAX_PAGENUMBER = 581; // 爬取最大页码

const spiderQueue = async (soureUrl: string) => {
  const requestQueue: { title?: string; url?: string }[] = [];

  // 针对第一页特殊处理
  if (CURRY_PAGENUMBER !== 1) soureUrl = `${soureUrl}${CURRY_PAGENUMBER}.html`;

  const res: any = await request(soureUrl);
  const data = await res.text();
  const $ = cheerio.load(data);

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
};

const loadHtml = async (url?: string, title?: string) => {
  if (!url || !title) return;
  try {
    const res: any = await request(url);
    const data = await res.text();
    const $ = cheerio.load(data);
    const soureURL = url.substring(0, url.length - 5);

    // 取得总页码
    const numClass = $("#title .imageset-sum").html();
    const forNum = numClass ? +numClass.slice(2) : 0;

    const loadQueue: string[] = [];
    for (let index = 1; index <= forNum; index++) {
      if (index === 1)
        loadQueue.push((await loadImages(`${soureURL}.html`)) || "");
      else
        loadQueue.push((await loadImages(`${soureURL}_${index}.html`)) || "");
    }

    await saveImages(loadQueue, title);
  } catch (error) {
    console.log(`loadHtml: 下载${title}时出现错误！`);
    console.log(error);
  }
};

const loadImages = async (url: string) => {
  try {
    const res: any = await request(url);
    const data = await res.text();
    const $ = cheerio.load(data);
    return $(".img_box a img").attr("src") || "";
  } catch (error) {
    console.log(`loadImages: 下载${url}时出现错误！`);
    console.log(error);
  }
};

(async () => {
  while (CURRY_PAGENUMBER <= MAX_PAGENUMBER) {
    await spiderQueue(urlArray[0]);
    CURRY_PAGENUMBER++;
  }
})();
