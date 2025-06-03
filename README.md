# 浏览器网页抓包插件(需要打开检查)

> 根据自身要获取数据实际情况更改一淘宝为例
> 接口地址在backgroud.js配置TASK_API_URL  manifest.json 需要配置host_permissions 自己的任务接口需要配置进去

## 使用流程

1. 打开检查,每次加载插件都需要重新打开(F12 OR 右键鼠标=>选择检查)
2. 在 devtools_page 中的抓取数据，保存到浏览器 localStorage（之筛选自己需要的数据）
3. 然后再页面脚本(content.js)通过监听页面的 load 事件获取保存的数据(然后通过拿到的数据做些自定义操作)

## 文件介绍

```base
  - img #图片资源
  - js  #主要代码文件
      - lib #三方的依赖库
      - background.js # background脚本文件 用于发送请求，部分网页禁止http
      - config.js # 配置文件 插件的一些配置内容
      - content.js # 插件主入口文件
      - devtools.js # devtools页面的脚本 用于获取相应内容
      - panel.js # 插件注入页面
      - utils.js # js公用函数
  - devtools.html # devtools入口
  - manifest.json # 插件文件
```

## Other

如果不想使用检查功能，可使用修改页面的 XML 或者 fetch，添加成功后的回调来获取相应内容发送到插件
