const fs = require("fs");
const crypto = require("crypto");

/**
 * 计算并返回文件 hash
 * @param {*} path
 * @returns
 */
const calculateHash = (path) => {
  const buffer = fs.readFileSync(path);
  const hash = crypto.createHash("md5");
  hash.update(buffer, "utf8");

  return hash.digest("hex");
};

/**
 * 通过检查文件 hash 去重
 * @param {*} path 文件路径
 */
const simpleRepeat = (path) => {
  const alreadyPath = fs.readdirSync(path);
  const hashList = [];

  alreadyPath.forEach((item) => {
    const hash = calculateHash(`${path}/${item}`);
    hashList.push({ pathname: item, hash });
  });

  const onlyHashList = {};
  hashList.forEach((item) => {
    if (onlyHashList[item.hash]) fs.unlinkSync(`${path}/${item.pathname}`);
    else onlyHashList[item.hash] = item;
  });

  console.log("去重完毕");
};

module.exports = simpleRepeat;
