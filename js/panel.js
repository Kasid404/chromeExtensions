

class Panel {
  constructor() {
    this.template = `
      <div style='color:#000; margin: 0 auto;background: #f7f7f7;margin-bottom: 20px;width: 100px;padding: 10px;padding-bottom:10px;position: fixed;left: 10px;top: 10px;z-index: 2147483647;border: 1px solid #040;border-radius: 2px;box-sizing: content-box !important;overflow: hidden;font-size: 12px'>
        <div style="display: flex;flex-direction: column;">
          <div id="${DOM_IDS.task_get}" style="font-size:30px;color:green;line-height: 30px;font-weight: 800;">0</div>
          <div id="${DOM_IDS.task_success}" style="font-size:30px;color:red;margin-top:1px;line-height: 30px;font-weight: 800;">0</div>
        </div>
        <div  style="display: flex;flex-wrap: wrap;margin:8px 0">
            <div id="${DOM_IDS.task_start}" style="line-height:20px;text-align:center;width: 20px;height: 20px;background-color: #7280f7">启</div>
            <div id="${DOM_IDS.clearData}" style="line-height:20px;text-align:center;width: 20px;height: 20px;margin-left:8px;background-color: #52aae1;">清</div>
        </div>
        <div style="margin-bottom: 5px;display: flex;flex-direction: row;margin-top: 4px;box-sizing: border-box;border: 1px solid rgb(220, 223, 230);border-radius: 4px;overflow: hidden;">
          <input id="${DOM_IDS.userId}" type="text" placeholder="标识" style="border-right: 1px solid #dad0d0;height: 20px;color: rgb(96, 98, 102);font-size: 12px;min-width: 76px;border: none;outline: none;padding: 0px 10px;" />
        </div>
        <div style="width: 100%;display: flex;flex-direction: column;">
          <input id="${DOM_IDS.interval}" autocomplete="off" type="text" placeholder="时间间隔(s)" style="border: 1px solid #dad0d0;height: 20px;color: rgb(2, 3, 3);font-size: 12px;outline: none;padding: 0px 8px;" />
        </div>
      </div>
    `;
  }

  async init() {
    // 添加面板到页面
    $("body").append(this.template);

    // 绑定事件
    this.bindEvents();

    // 初始化显示
    await this.updateDisplay();
  }

  async bindEvents() {

    // 时间间隔输入事件
    $(`#${DOM_IDS.interval}`).on("input", async (e) => {
      const value = e.target.value.replace(/[^0-9]/g, "");
      await storage.set({ interval: value });
      e.target.value = value;
    });

    // 清空按钮点击事件
    $(`#${DOM_IDS.clearData}`).on("click", async () => {
      $(`#${DOM_IDS.clearData}`)
      .css({
        background: getRandomHexColor(),
        color: "#fff"
      });
      await storage.set({
        task: {},
        task_get: 0,
        task_success: 0,
        taskStatus: 0,
        userId: "",
        logs: "[]"
      });
      await this.updateDisplay();
    });
  }

  async updateDisplay() {
    const data = await storage.get({
      task: {},
      task_get: 0,
      task_success: 0,
      taskStatus: 0,
      userId: "",
      interval: 10
    });

    // 更新显示
    $(`#${DOM_IDS.interval}`).val(data.interval);
    $(`#${DOM_IDS.task_get}`).text(`${data.task_get}`);
    $(`#${DOM_IDS.task_success}`).text(`${data.task_success}`);
    $(`#${DOM_IDS.userId}`).val(data.userId);

    // 更新任务状态
    const buttonStyle = data.taskStatus === 0 
      ? { text: "启", background: "#7280f7" }
      : { text: "停", background: "#000" };
    
    $(`#${DOM_IDS.task_start}`)
      .text(buttonStyle.text)
      .css({
        background: buttonStyle.background,
        color: "#fff"
      });
  }
}