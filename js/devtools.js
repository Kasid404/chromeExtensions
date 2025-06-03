// 拦截请求
const CD = chrome.devtools;
// Chrome DevTools Extension中不能使用console.log
const log = (...params) =>
  CD.inspectedWindow.eval(`console.log(...${JSON.stringify(params)})`);
let spiderSwitch = true;
chrome.devtools.network.onRequestFinished.addListener(async (...args) => {
  try {
    const [
      {
        // 请求的类型，查询参数，以及url
        request: { method, queryString, url, postData },
        response: { bodySize, status, header },
        getContent,
      },
    ] = args;

    var timestamp = (new Date().getTime() + 8 * 60 * 60 * 1000).toString();
    const content = await new Promise((res, rej) => getContent(res));

    const data = {
      ...args[0],
      content: content,
    };
    //https://detail.m.tmall.com/item.htm?id=732594033726
    if (
      args[0].request.url.includes(
        "https://h5api.m.tmall.com/h5/mtop.taobao.detail.data.get/1.0"
      )
    ) {
      const num = content.match(/mtopjsonp(\d+)/)[1];
      json = content.trim().split(`mtopjsonp${num}(`)[1].slice(0, -1);
      CD.inspectedWindow.eval(
        `localStorage.setItem("goodsData", ${JSON.stringify(json)});`
      );
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "pushData",
            data: json,
          },
          (response) => {
            // log("Page title:", response.pageTitle);
          }
        );
      });
    }
    //https://h5.m.taobao.com/awp/core/detail.htm?ft=t&id=820449340237
    if (
      args[0].request.url.includes(
        "https://h5api.m.taobao.com/h5/mtop.taobao.detail.data.get/1.0/"
      )
    ) {
      const num = content.match(/mtopjsonp(\d+)/)[1];
      json = content.trim().split(`mtopjsonp${num}(`)[1].slice(0, -1);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "pushData",
            data: json,
          },
          (response) => {
            // log("Page title:", response.pageTitle);
          }
        );
      });
      CD.inspectedWindow.eval(
        `localStorage.setItem("goodsData", ${JSON.stringify(json)});`
      );
    }

    //https://detail.tmall.com/item.htm?id=810344810368
    //
    //https://h5api.m.tmall.com/h5/mtop.taobao.pcdetail.data.get/1.0/?jsv=2.7.4&appKey=12574478&t=1732852638885&sign=4696562aaff43e95855b7f381d154a6c&api=mtop.taobao.pcdetail.data.get&v=1.0&isSec=0&ecode=0&timeout=10000&ttid=2022%40taobao_litepc_9.17.0&AntiFlood=true&AntiCreep=true&dataType=json&valueType=string&type=json&data=%7B%22id%22%3A%22615141560010%22%2C%22detail_v%22%3A%223.3.2%22%2C%22exParams%22%3A%22%7B%5C%22id%5C%22%3A%5C%22615141560010%5C%22%2C%5C%22queryParams%5C%22%3A%5C%22id%3D615141560010%5C%22%2C%5C%22domain%5C%22%3A%5C%22https%3A%2F%2Fchaoshi.detail.tmall.com%5C%22%2C%5C%22path_name%5C%22%3A%5C%22%2Fitem.htm%5C%22%7D%22%7D
    if (
      args[0].request.url.includes(
        "https://h5api.m.tmall.com/h5/mtop.taobao.pcdetail.data.get/1.0"
      ) &&
      content
    ) {
      let json = content;
      if (content.includes("令牌为空")) return;
      if (content.includes("mtopjsonppcdetail")) {
        const num = content.match(/mtopjsonppcdetail(\d+)/)[1];
        json = content.trim().split(`mtopjsonppcdetail${num}(`)[1].slice(0, -1);
      }
      jsonData = JSON.parse(json);
      if (!jsonData.ret) {
        return;
      }
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "pushData",
            data: json,
          },
          (response) => {
            // log("Page title:", response.pageTitle);
          }
        );
      });
    }
    if (
      (args[0].request.url.includes(
        "https://h5api.m.taobao.com/h5/mtop.taobao.detail.getdesc/7.0/"
      ) ||
        args[0].request.url.includes(
          "https://h5api.m.tmall.com/h5/mtop.taobao.detail.getdesc/7.0/"
        ) ||
        args[0].request.url.includes(
          "https://h5api.m.tmall.com/h5/mtop.taobao.detail.getdesc/6.0/"
        ) ||
        args[0].request.url.includes(
          "https://h5api.m.tmall.hk/h5/mtop.taobao.detail.getdesc/7.0/"
        )) &&
      content
    ) {
      let json = content;
      if (content.includes("令牌为空")) return;
      if (content.includes("mtopjsonp")) {
        const num = content.match(/mtopjsonp(\d+)/)[1];
        json = content.trim().split(`mtopjsonp${num}(`)[1].slice(0, -1);
      }
      jsonData = JSON.parse(json);
      if (!jsonData.ret) {
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "descData",
            data: jsonData,
          },
          (response) => {
            // log("Page title:", response.pageTitle);
          }
        );
      });
    }

    if (
      args[0].request.url.includes(
        "https://h5api.m.tmall.hk/h5/mtop.taobao.pcdetail.data.get/1.0/"
      )
    ) {
      let json = content;
      if (content.includes("令牌为空")) return;
      if (content.includes("mtopjsonppcdetail")) {
        const num = content.match(/mtopjsonppcdetail(\d+)/)[1];
        json = content.trim().split(`mtopjsonppcdetail${num}(`)[1].slice(0, -1);
      }
      jsonData = JSON.parse(json);
      if (!jsonData.ret) {
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "pushData",
            data: json,
          },
          (response) => {
            // log("Page title:", response.pageTitle);
          }
        );
      });
      CD.inspectedWindow.eval(
        `localStorage.setItem("goodsData", ${JSON.stringify(json)});`
      );
    }
    //https://item.taobao.com/item.htm?spm=a21n57.1.item.1.1a26523cJQRwRK&priceTId=2147bf7e17248970491584758ed3e1&utparam=%7B%22aplus_abtest%22:%22dff651e562fa5797e68ee7871e39832a%22%7D&id=736731918123&ns=1&xxc=ad_ztc&skuId=5320775439786&pisk=fSCohuwx5ni1WcF23qR7p8Z68N2vP4OBFMhpvBKU3n-jwp-LFMvhvi9FwQQRmHSOxeCR96XjtN_CwzOLPQ_WOBrTX5ChPaOCNsJLy_Aque7284lEqaRSzBrTXWDxuLZJT9KjGDDq3Ft2zeREUrA2-ecyTLJFurYeJ0kEaMzcunTna4lyUSu2JUlyTb-r3m8e-48rTLJ20nTeTXJerK322MS5guPK__EC6ifDrK2OznRpOyLyERbk0XyRfUm6ba-mTX-7iElc8Mrn9CW1m6vNXWcXwNX2gUX08x-yITSJlMVia35cz_-RaohJ4__VB6I48X-h3OJGQarxnEXVysvA_lcHFtS5CpfLD5ORBNCBQ_Pofnp6-GAPnollbgJE3AzGBXT4JskIdL8XohhGOynJZ7tLPr4mQO9ylUPTorDIdL8XohU0oAW6UETz6
    if (
      args[0].request.url.includes(
        "https://h5api.m.taobao.com/h5/mtop.taobao.pcdetail.data.get/1.0"
      )
    ) {
      if (content.includes("令牌为空")) return;
      jsonData = JSON.parse(content);
      if (!jsonData.ret) {
        return;
      }
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "pushData",
            data: content,
          },
          (response) => {
            // log("Page title:", response.pageTitle);
          }
        );
      });
      CD.inspectedWindow.eval(
        `localStorage.setItem("goodsData", ${JSON.stringify(content)});`
      );
    }
    if (
      args[0].request.url.includes(
        "https://h5api.m.tmall.hk/h5/mtop.taobao.detail.data.get/1.0"
      )
    ) {
      const num = content.match(/mtopjsonp(\d+)/)[1];
      json = content.trim().split(`mtopjsonp${num}(`)[1].slice(0, -1);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "pushData",
            data: json,
          },
          (response) => {
            // log("Page title:", response.pageTitle);
          }
        );
      });
      CD.inspectedWindow.eval(
        `localStorage.setItem("goodsData", ${JSON.stringify(json)});`
      );
    }
  } catch (err) {
    log(err.stack || err.toString());
  }
});
