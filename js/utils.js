/**
 * @description 生成指定长度的随机字母字符串，默认长度为8
 * @param {*} length  字符串长度；默认长度为8
 * @returns {string} 随机字符串
 */
function generateRandomString(length = 8) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// 储存
const storage = {
  get: (options) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(options, (result) => resolve(result));
    });
  },

  set: (options) => {
    return new Promise((resolve) => {
      chrome.storage.local.set(options, () => resolve());
    });
  },
};

const isAppGoods = () => {
  let sign = false;
  if (window.document.body.innerHTML.includes("商品仅支持在客户端购买")) {
    sign = true;
    return sign;
  }
  return sign;
};

const isGoodsNotFount = () => {
  let sign = false;
  if (window.document.body.innerHTML.includes("宝贝不在了")) {
    sign = true;
    return sign;
  }
  if (location.href.includes("https://mdetail.tmall.com/mobile/notfound.htm")) {
    sign = true;
    return sign;
  }
  if (location.href.includes("https://mdetail.tmall.com/mobile/notfound.htm")) {
    sign = true;
    return sign;
  }
  if (
    location.href.includes("https://h5.m.taobao.com/detailplugin/expired.html")
  ) {
    sign = true;
    return sign;
  }
  return sign;
};

function getUrlParams(url) {
  const params = {};
  const regex = /[?&]([^=#]+)=([^&#]*)/g;
  let match;
  while ((match = regex.exec(url))) {
    params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
  }
  return params;
}

const isLoginPage = () => {
  let sign = false;
  // 淘宝的登录页面
  if (location.href.startsWith("https://login.taobao.com")) {
    sign = true;
    return sign;
  }
  if (location.href.startsWith("https://login.m.taobao.com")) {
    sign = true;
    return sign;
  }
};

const isVerifyPage = () => {
  let sign = false;
  // 淘宝的验证1
  let verifyDom = $(".J_MIDDLEWARE_FRAME_WIDGET");
  if (verifyDom.length > 0) {
    verifyDom.css("z-index", 2147483646);
    sign = true;
    return sign;
  }
  // 淘宝的验证2
  let verifyForm = $("#nc-verify-form");
  if (verifyForm.length > 0) {
    sign = true;
    return sign;
  }
  // 淘宝的验证3
  verifyDom = $(".captcha-tips");
  if (verifyDom.length > 0) {
    sign = true;
    return sign;
  }
  return sign;
};
/**
 * 获取用户id
 */
const getAccountId = () => {
  let accountId = "";
  //淘宝
  if (document.cookie.indexOf(" tracknick") >= 0) {
    accountId = document.cookie.match(/ tracknick=(.*?);/)[1];
  }
  //淘宝的
  if (document.cookie.indexOf(" lgc") >= 0 && !accountId) {
    accountId = document.cookie.match(/ lgc=(.*?);/)[1];
  }
  //淘宝的
  if (document.cookie.indexOf(" _tb_token_") >= 0 && !accountId) {
    accountId = document.cookie.match(/ _tb_token_=(.*?);/)[1];
  }
  //淘宝的
  if (document.cookie.indexOf(" 3PcFlag") >= 0 && !accountId) {
    accountId = document.cookie.match(/ 3PcFlag=(.*?);/)[1];
  }
  return accountId;
};

/**
 * 获取sessionId
 */
const getSessionId = () => {
  let sessionId = "";
  //淘宝的
  if (document.cookie.indexOf(" _tb_token_") >= 0) {
    sessionId = document.cookie.match(/ _tb_token_=(.*?);/)[1];
  }
  return sessionId;
};
/**
 * 获取chrome本地存储
 * @param {*} options
 * @returns Object
 */
const getLocalStorage = (options) => {
  return new Promise((resolve, reject) => {
    try {
      if (!options) {
        console.log("key is null!");
        reject();
        return;
      }

      chrome.storage.local.get(options, (items) => {
        resolve(items);
      });
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * 存储数据到chrome
 */
const setLocalStorage = (options) => {
  chrome.storage.local.set(options);
};

/**
 * 获取uuid
 */
const getUuid = () => {
  var temp_url = URL.createObjectURL(new Blob());
  var uuid = temp_url.toString(); // blob:https://xxx.com/b250d159-e1b6-4a87-9002-885d90033be3
  URL.revokeObjectURL(temp_url);
  return uuid.substr(uuid.lastIndexOf("/") + 1);
};

/**
 * @description 生成随机颜色
 * @returns @{string} 随机颜色
 */
function getRandomHexColor() {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;
}
