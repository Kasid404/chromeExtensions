// 全局状态变量
const state = {
  timer: null, // 定时器引用
  isUpload: false, // 上传状态标志
  descData: null, // 描述数据
  goodsData: null, // 商品数据
  pushDataTimerId: null, // 数据推送定时器ID
};

/**
 * 初始化消息监听器
 */
function initMessageListener() {
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log('收到消息:', message);
    
    // 处理描述数据
    if (message.action === "descData") {
      state.descData = message.data;
    }
    
    // 处理推送数据
    if (message.action === "pushData") {
      await handlePushData(message);
    }

    // 当有商品数据和描述数据且未上传时，执行上传
    if (state.goodsData && state.descData && !state.isUpload) {
      await handleDataUpload();
    }
  });
}

/**
 * 处理推送数据
 * @param {Object} message - 消息对象
 */
async function handlePushData(message) {
  // 检查是否需要登录
  if (message.data.includes("登录查看")) {
    await updateTaskStatus(0);
    return;
  }

  // 检查API调用是否成功
  if (!message.data.includes("调用成功")) {
    console.log("判断是否是验证页面");
    if (isVerifyPage()) {
      clearTimeout(state.timer);
      await updateTaskStatus(0);
    }
    return;
  }

  // 检查是否可以推送数据
  if (await checkCanPush(JSON.parse(message.data))) {
    state.goodsData = JSON.parse(message.data);
  }
}

/**
 * 处理数据上传
 */
async function handleDataUpload() {
  clearTimeout(state.pushDataTimerId);
  state.pushDataTimerId = null;
  state.isUpload = true;
  
  const postData = {
    ...state.goodsData.data,
    desc: state.descData,
  };
  
  console.log('准备上传的数据:', postData);
  await pushTaskResult(postData);
}

initMessageListener();

/**
 * 更新任务状态
 * @param {number} status - 任务状态 (0: 停止, 1: 运行)
 */
async function updateTaskStatus(status) {
  await setLocalStorage({ taskStatus: status });
  await updateDom();
}


/**
 * 初始化页面
 */
$(document).ready(async function () {
  const panel = new Panel();
  panel.init();
  
  // 绑定开始/停止按钮点击事件
  $(`#${DOM_IDS.task_start}`).on("click", handleStartButtonClick);
});

/**
 * 处理开始按钮点击事件
 */
async function handleStartButtonClick() {
  const userId = $(`#${DOM_IDS.userId}`).val();
  await setLocalStorage({ userId });
  
  const buttonText = $(`#${DOM_IDS.task_start}`).text();
  
  if (buttonText === "启") {
    if (!await validateUserId()) return;
    
    await updateTaskStatus(1);
    updateButtonUI("停", "#000", "#fff");
    await startGetTask();
  } else {
    await updateTaskStatus(0);
    updateButtonUI("启", "#7280f7", "#fff");
  }
}

/**
 * 验证用户ID
 * @returns {Promise<boolean>} 是否验证通过
 */
async function validateUserId() {
  if (!checkUserIdLegal()) {
    alert("请填写正确的手机号");
    return false;
  }
  return true;
}

/**
 * 更新按钮UI
 * @param {string} text - 按钮文本
 * @param {string} bgColor - 背景颜色
 * @param {string} textColor - 文字颜色
 */
function updateButtonUI(text, bgColor, textColor) {
  $(`#${DOM_IDS.task_start}`)
    .text(text)
    .css({
      background: bgColor,
      color: textColor
    });
}

/**
 * 更新DOM元素
 */
const updateDom = async () => {
  const baseInfo = await getLocalStorage({
    task: {},
    task_get: 0,
    task_success: 0,
    taskStatus: 0,
    userId: "",
    interval: 10,
  });
  
  // 更新表单元素
  $(`#${DOM_IDS.interval}`).val(baseInfo.interval);
  $(`#${DOM_IDS.task_get}`).text(`${baseInfo.task_get}`);
  $(`#${DOM_IDS.task_success}`).text(`${baseInfo.task_success}`);
  $(`#${DOM_IDS.userId}`).val(baseInfo.userId);

  // 更新按钮状态
  updateButtonUI(
    baseInfo.taskStatus === 0 ? "启" : "停",
    baseInfo.taskStatus === 0 ? "#7280f7" : "#000",
    "#fff"
  );
};

/**
 * 开始获取任务
 */
const startGetTask = async () => {
  const code = dayjs().format("mmssSSS");
  console.log("开始获取任务", code);
  
  const chromeLocalStorage = await getLocalStorage({
    task_get: 0,
    taskStatus: 0,
    userId: "",
  });
  
  // 验证前置条件
  if (!await validateTaskPreconditions(chromeLocalStorage)) return;
  
  const uuid = getUuid();
  const data = {
    uuid,
    userId: chromeLocalStorage.userId,
    code,
  };
  
  // 发送获取任务请求
  chrome.runtime.sendMessage(
    {
      type: "getTask",
      data: data,
      reqHeaders: getRequestHeaders(chromeLocalStorage.userId),
    },
    handleGetTaskResponse(code, chromeLocalStorage)
  );
};

/**
 * 验证任务前置条件
 * @param {Object} storage - 本地存储数据
 * @returns {Promise<boolean>} 是否验证通过
 */
async function validateTaskPreconditions(storage) {
  const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
  
  if (!storage.userId || !reg.test(storage.userId) || 
      !checkIsLogin() || storage.taskStatus === 0) {
    await updateTaskStatus(0);
    return false;
  }
  
  return true;
}

/**
 * 获取请求头
 * @param {string} userId - 用户ID
 * @returns {Object} 请求头对象
 */
function getRequestHeaders(userId) {
  return {
    authorization: config.KEY,
    version: config.API_VERSION,
    version_cus: config.API_VERSION,
    device: "web_extensions",
    account_id: md5(getAccountId()),
    session_id: md5(getSessionId()),
    user_id: userId,
  };
}

/**
 * 处理获取任务响应
 * @param {string} code - 任务代码
 * @param {Object} storage - 本地存储数据
 * @returns {Function} 回调函数
 */
function handleGetTaskResponse(code, storage) {
  return (response) => {
    if (!response) {
      console.error("请求失败：", response);
      return;
    }
    
    console.log("请求成功，数据是：", response);
    const task = response;
    task.code = code;
    
    // 根据状态码处理响应
    switch (task.status) {
      case 200:
        handleSuccessfulTaskResponse(task, storage);
        break;
      case 204:
      case 500:
      default:
        handleRetryTaskResponse(task);
        break;
    }
  };
}

/**
 * 处理成功的任务响应
 * @param {Object} task - 任务对象
 * @param {Object} storage - 本地存储数据
 */
async function handleSuccessfulTaskResponse(task, storage) {
  await setLocalStorage({
    task: task,
    task_get: storage.task_get + 1,
  });
  window.location.href = task.data.url;
}

/**
 * 处理需要重试的任务响应
 * @param {Object} task - 任务对象
 */
function handleRetryTaskResponse(task) {
  const delay = (task.sleep_time || (task.status === 204 ? 20 : 50)) * 1000;
  setTimeout(startGetTask, delay);
}

/**
 * 提交任务结果
 * @param {Object} data - 要提交的数据
 */
const pushTaskResult = async (data) => {
  const { task, userId, interval } = await getLocalStorage({
    task: {},
    userId: "",
    interval: 10,
  });
  
  const code = dayjs().format("mmssSSS");
  const uuid = getUuid();
  
  const postObj = {
    getDto: task.data,
    data: data,
    url: window.location.href,
  };
  
  localStorage.removeItem("goodsData");
  
  // 提交数据
  chrome.runtime.sendMessage(
    {
      type: "pushTask",
      data: postObj,
      code: "code",
      reqHeaders: getRequestHeaders(userId),
    },
    handlePushTaskResponse(code, interval)
  );
};

/**
 * 处理推送任务响应
 * @param {string} code - 任务代码
 * @param {number} interval - 间隔时间
 * @returns {Function} 回调函数
 */
function handlePushTaskResponse(code, interval) {
  return async (res) => {
    if (!res) {
      console.error("请求失败：", res);
      return;
    }
    
    console.log("请求成功，数据是：", res);
    await setLocalStorage({ task: {} });
    
    res.code = code;
    const sleepTime = res.sleep_time || (res.status === 200 ? interval : 120);
    
    // 根据状态码处理响应
    switch (res.status) {
      case 200:
        await handleSuccessfulPushResponse();
        break;
    }
    
    // 设置重试
    setTimeout(startGetTask, sleepTime * 1000);
    await updateDom();
  };
}

/**
 * 处理成功的推送响应
 */
async function handleSuccessfulPushResponse() {
  const { task_success } = await getLocalStorage({ task_success: 0 });
  await setLocalStorage({ task_success: task_success + 1 });
}

/**
 * 验证用户ID是否合法
 * @returns {boolean} 是否合法
 */
const checkUserIdLegal = () => {
  const userId = $(`#${DOM_IDS.userId}`).val();
  const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
  return !!userId && reg.test(userId);
};

/**
 * 验证是否已登录
 * @returns {boolean} 是否已登录
 */
const checkIsLogin = () => {
  return !!getAccountId();
};

/**
 * 验证是否可以推送数据
 * @returns {Promise<boolean>} 是否可以推送
 */
const checkCanPush = async () => {
  // 在这里添加验证逻辑
  return true;
};