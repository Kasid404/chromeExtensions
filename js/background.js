/**
 * 任务接口地址
 */
const TASK_API_URL = "你的任务接口地址"; // 替换为实际的任务接口地址

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getTask") {
    // 异步逻辑处理
    getTask(request.data, request.reqHeaders)
      .then((data) => {
        console.log("获取任务结果", data);
        sendResponse(data); // 异步返回响应
      })
      .catch((error) => {
        console.log("获取任务接口错误", error);
      });
  }
  if (request.type === "pushTask") {
    // 异步逻辑处理
    pushTask(request.data, request.code, request.reqHeaders)
      .then((data) => {
        console.log("提交任务结果", data);
        sendResponse(data); // 异步返回响应
      })
      .catch((error) => {
        console.log("提交任务接口错误", error);
      });
  }
  return true;
});

const getTask = async (data, headersData = {}) => {
  try {
    console.log("获取任务接口", data);
    const headers = {
      ...headersData,
      ct: Math.floor(Date.now() / 1000),
    };
    const response = await fetch(
      `${TASK_API_URL}?code=${data.code}&debug=true`,
      {
        method: "GET",
        headers: headers,
      }
    );

    if (response.status === 204) {
      const sleepTime = response.headers.get("sleep_time");
      return {
        status: response.status,
        sleep: sleepTime,
      };
    } else {
      const responseData = await response.json();
      return {
        status: response.status,
        ...responseData,
      };
    }
  } catch (error) {
    console.log("获取任务接口错误", error);
    return {
      status: error.status,
      ...(error.response?.data || {}),
    };
  }
};

/**
 * 提交任务接口
 */
const pushTask = async (data, code, headersData = {}) => {
  try {
    const headers = {
      ...headersData,
      ct: Math.floor(Date.now() / 1000),
      "Content-Type": "application/json",
    };

    const response = await fetch(`${TASK_API_URL}?code=${code}&debug=true`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (response.status === 204) {
      const sleepTime = response.headers.get("sleep_time");
      return {
        status: response.status,
        sleep: sleepTime,
      };
    } else {
      const responseData = await response.json();
      return {
        status: response.status,
        ...responseData,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      status: error.status,
      ...(error.response?.data || {}),
    };
  }
};
