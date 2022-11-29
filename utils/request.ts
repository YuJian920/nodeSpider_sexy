import fetch from "node-fetch";

export const headerOption: HeadersInit = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "accept-encoding": "gzip, deflate, br",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.47",
};

/**
 * 基础请求封装
 * @param api
 * @param option
 * @returns
 */
export const request = async (api: string, option: RequestInit = {}) => {
  return await fetch(api, {
    headers: headerOption,
    // agent: new HttpsProxyAgent("http://127.0.0.1:7890"),
    ...option,
  });
};
