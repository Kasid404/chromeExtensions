let timer = null;
var isUpload = false;
var descData = null;
var goodsData = null;
var pushDataTimerId = null;
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log(message);
  if (message.action === "descData") {
    descData = message.data;
  }
  if (message.action === "pushData") {
    if (message.data.includes("登录查看")) {
      setLocalStorage({ taskStatus: 0 });
      updateDom();
      return;
    }
    if (!message.data.includes("调用成功")) {
      // 是否是验证页面
      console.log("判断是否是验证页面");
      if (isVerifyPage()) {
        clearTimeout(timer);
        setLocalStorage({
          taskStatus: 0,
        });
        updateDom();
      }
      return;
    }
    if (await checkCanPush(JSON.parse(message.data))) {
      goodsData = JSON.parse(message.data);
    }
    // let urlList =
    // sendResponse({ pageTitle: document.title });
  }

  if (goodsData && descData && !isUpload) {
    clearTimeout(pushDataTimerId);
    pushDataTimerId = null;
    isUpload = true;
    const postData = {
      ...goodsData.data,
      desc: descData,
    };
    console.log(postData);
    pushTaskResult(postData);
  }
});
$(document).ready(async function () {
  var panel = new Panel();
  panel.init();
  //点击开始
  $(`#${DOM_IDS.task_start}`).on("click", () => {
    setLocalStorage({ userId: $(`#${DOM_IDS.userId}`).val() });
    if ($(`#${DOM_IDS.task_start}`).text() == "启") {
      if (!checkUserIdLegal()) {
        alert("请填写正确的手机号");
        return;
      }
      setLocalStorage({ taskStatus: 1 });
      $(`#${DOM_IDS.task_start}`).text("停").css({
        background: "#000",
        color: "#fff",
      });
      startGetTask();
    } else {
      $(`#${DOM_IDS.task_start}`).text("启").css({
        background: "#7280f7",
        color: "#fff",
      });
      setLocalStorage({ taskStatus: 0 });
    }
  });
});

const updateDom = async () => {
  //获取基本信息
  let baseInfo = await getLocalStorage({
    task: {},
    task_get: 0,
    task_success: 0,
    taskStatus: 0,
    userId: "",
    interval: 10,
  });
  $(`#${DOM_IDS.interval}`).val(baseInfo.interval);
  $(`#${DOM_IDS.task_get}`).text(`${baseInfo.task_get}`);
  $(`#${DOM_IDS.task_success}`).text(`${baseInfo.task_success}`);
  $(`#${DOM_IDS.userId}`).val(baseInfo.userId);

  if (baseInfo.taskStatus == 0) {
    $(`#${DOM_IDS.task_start}`).text("启").css({
      background: "#7280f7",
      color: "#fff",
    });
  } else {
    $(`#${DOM_IDS.task_start}`).text("停").css({
      background: "#000",
      color: "#fff",
    });
  }
};

/**
 * 获取任务
 */
const startGetTask = async () => {
  let code = dayjs().format("mmssSSS");
  console.log("开始获取任务", code);
  const chromeLocalStorage = await getLocalStorage({
    task_get: 0,
    taskStatus: 0,
    userId: "",
  });
  // 获取商品ID前的判断(不用可以删除)
  const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
  if (chromeLocalStorage.userId == "") {
    setLocalStorage({ taskStatus: 0 });
    updateDom();
    return;
  }
  if (!reg.test(chromeLocalStorage.userId)) {
    setLocalStorage({ taskStatus: 0 });
    updateDom();
    return;
  }
  if (!checkIsLogin()) {
    setLocalStorage({ taskStatus: 0 });
    updateDom();
    return;
  }
  if (chromeLocalStorage.taskStatus == 0) {
    setLocalStorage({ taskStatus: 0 });
    updateDom();
    return;
  }
  const uuid = getUuid();
  const data = {
    uuid,
    userId: chromeLocalStorage.userId,
    code,
  };
  // const task = await getTask(data);
  chrome.runtime.sendMessage(
    {
      type: "getTask",
      data: data,
      reqHeaders: {
        authorization: config.KEY,
        version: config.API_VERSION,
        version_cus: config.API_VERSION,
        device: "web_extensions",
        account_id: md5(getAccountId()),
        session_id: md5(getSessionId()),
        user_id: chromeLocalStorage.userId,
      },
    },
    (response) => {
      console.log("获取任务结果", response);
      if (response) {
        console.log("请求成功，数据是：", response);
        // 👉 在这里使用返回的数据，比如更新 UI 跳转
        const task = response;
        task.code = code;
        // // 根据返回的内容执行操作
        switch (task.status) {
          case 200:
            setLocalStorage({
              task: task,
              task_get: chromeLocalStorage.task_get + 1,
            });
            window.location.href = task.data.url;
            break;
          case 204:
            setTimeout(function () {
              startGetTask();
            }, (task.sleep_time || 20) * 1000);
            break;
          case 500:
            setTimeout(function () {
              startGetTask();
            }, (task.sleep_time || 50) * 1000);
            break;
          default:
            setTimeout(function () {
              startGetTask();
            }, (task.sleep_time || 50) * 1000);
            break;
        }
      } else {
        console.error("请求失败：", response);
      }
    }
  );
};

/**
 * 提交任务
 */
const pushTaskResult = async (data) => {
  const { task, taskStatus, userId, interval } = await getLocalStorage({
    task: {},
    taskStatus: 0,
    userId: "",
    interval: 10,
  });
  let code = dayjs().format("mmssSSS");
  const uuid = getUuid();
  let lastData = data;
  const postObj = {
    getDto: task.data,
    data: lastData,
    url: window.location.href,
  };
  localStorage.removeItem("goodsData");
  //提交数据
  chrome.runtime.sendMessage(
    {
      type: "pushTask",
      data: postObj,
      code: "code",
      reqHeaders: {
        authorization: config.KEY,
        version: config.API_VERSION,
        version_cus: config.API_VERSION,
        device: "web_extensions",
        account_id: md5(getAccountId()),
        session_id: md5(getSessionId()),
        user_id: userId,
      },
    },
    async (res) => {
      console.log("获取任务结果", res);
      if (res) {
        console.log("请求成功，数据是：", res);
        //清空数据
        setLocalStorage({
          task: {},
        });
        res.code = code;
        //间隔时间
        let randomSleepTime = interval ?? 10;
        res.sleep_time = randomSleepTime;
        //根据请求返回内容执行操作
        switch (res.status) {
          case 200:
            const { task_success } = await getLocalStorage({ task_success: 0 });
            setLocalStorage({
              task_success: task_success + 1,
            });
            setTimeout(function () {
              startGetTask();
            }, (res.sleep_time || 10) * 1000);
            break;
          case 500:
            setTimeout(function () {
              startGetTask();
            }, (res.sleep_time || 120) * 1000);
            break;
          default:
            setTimeout(() => {
              startGetTask();
            }, (res.sleep_time || 120) * 1000);
            break;
        }
        //   流程结束更新页面数据
        updateDom();
        // 👉 在这里使用返回的数据，比如更新 UI
      } else {
        console.error("请求失败：", response);
      }
    }
  );
};

/**
 * @description 验证是否填写手机号
 * @return Boolean
 */
const checkUserIdLegal = () => {
  const userId = $(`#${DOM_IDS.userId}`).val();
  if (userId == "") {
    return false;
  }
  const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
  if (!reg.test(userId)) {
    return false;
  }
  return true;
};

/**
 * @description 验证是否已登陆
 * @return Boolean
 */
const checkIsLogin = () => {
  const accountId = getAccountId();
  if (accountId) {
    return true;
  } else {
    return false;
  }
};
/**
 * @description 验证是否满足上传数据条件
 * @return Boolean
 */
const checkCanPush = async () => {
  // 在这检查是否满足上传数据的条件（不满足则返回fasle）
  return true;
};
