// 消息窗口ID
var dialogId = 0;
// 需要打开激活的url
var tasks = null;
// 旧的循环器
var oldTimer = null;
// 检查准备工作URL自动打开（账号登录 商品规格选择 手工）
var tickTime = 120000; // 120000 2分钟

var isRunning = false;
var taskList = [];
chrome.extension.onConnect.addListener(function(port) {
  console.info("Connected：" + port.name);

  port.onMessage.addListener(function(msg) {
    console.info("message from popup：");
    console.info(msg);
    if (msg.op === "start") {
      processTask(msg.time);
      isRunning = true;
      port.postMessage("started");
    }
    if (msg.op === "update") {
      processTask(msg.time);
      isRunning = true;
      port.postMessage("started");
    } else if (msg.op === "stop") {
      if (oldTimer != null) {
        clearInterval(oldTimer);
      }
      isRunning = false;
      port.postMessage("stopped");
    }
  });
});

/**
 * 每隔500ms去检查任务,异步处理任务
 */
function processTask(standerTime) {
  console.info("秒杀任务倒计时！");

  if (oldTimer != null) {
    clearInterval(oldTimer);
  }

  chrome.storage.local.get({ tasks: [] }, function(value) {
    taskList = value.tasks;
    for (let idx = 0; idx < taskList.length; idx++) {
      let task = taskList[idx];
      task.excuting = false;
      task.step = 0;
    }
    console.info("任务列表");
    console.info(taskList);

    if (taskList.length > 0) {
      let timer = setInterval(function() {
        standerTime += 500;
        let count = 0;
        for (let i = 0; i < taskList.length; i++) {
          let task = taskList[i];
          if (task.status === 1) {
            let timeLeft = task.killTimeNumber - standerTime;
            if (timeLeft < -2000) {
              task.excuting = false;
              count++;
              continue;
            }

            if (task.excuting) {
              continue;
            }

            console.info(task.title + "剩余时间：" + timeLeft);
            if (timeLeft >= tickTime && timeLeft <= tickTime + 600) {
              console.info(task.title + "秒杀任务准备提示！");
              notifyBeforeStart(task);
            } else if (timeLeft >= -2000 && timeLeft <= 5000) {
              task.excuting = true;
              console.info(task.title + "执行秒杀任务！");
              startTask(task);
            }
          }
          if (count === taskList.length) {
            clearInterval(timer);
            isRunning = false;
          }
        }
      }, 500);
      oldTimer = timer;
    }
  });
}

/* Respond to the user's clicking one of the buttons */
chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
  let taskId = notifId.split("-")[1];
  if (notifId.startsWith("openLinkNotify-")) {
    if (btnIdx === 0) {
      for (let i = 0; i < taskList.length; i++) {
        if (taskId === taskList[i].id) {
          chrome.tabs.create({ url: taskList[i].url });
          chrome.notifications.clear(notifId);
        }
      }
    } else if (btnIdx === 1) {
      chrome.notifications.clear(notifId, function() {
        console.info("忽略本次任务！");
      });
    }
  }
  if (notifId.startsWith("activeTabNotify-")) {
    if (btnIdx === 0) {
      for (let i = 0; i < taskList.length; i++) {
        if (taskId === taskList[i].id) {
          chrome.tabs.query({ url: taskList[i].url }, function(results) {
            chrome.tabs.update(results[0].id, { active: true }, function() {
              console.info("抢购页面被激活！");
            });
            chrome.notifications.clear(notifId);
          });
        }
      }
    } else if (btnIdx === 1) {
      chrome.notifications.clear("openLinkNotify", function() {
        console.info("抢购页面未被激活！");
        chrome.notifications.clear(notifId);
      });
    }
  }
});

function notifyBeforeStart(task) {
  // 秒杀开始提醒（检查是否打开相关标签页）没有提示打开
  chrome.tabs.query({ url: task.url }, function(tabs) {
    if (tabs === undefined || tabs.length === 0) {
      chrome.notifications.create("openLinkNotify-" + task.id, {
        type: "basic",
        iconUrl: "image/link.png",
        title: "秒杀助手提醒",
        message:
          task.title +
          "\n任务将在2分钟后开始，抢购页面尚未打开，是否前往相关页面！",
        buttons: [{ title: "打开抢购页面" }, { title: "忽略" }]
      });
    } else {
      let noActive = true;
      for (let j = 0; j < tabs.length; j++) {
        if (tabs[j].active) {
          noActive = false;
          break;
        }
      }
      if (noActive) {
        // 已经打开但是未激活
        chrome.notifications.create("activeTabNotify-" + task.id, {
          type: "basic",
          iconUrl: "image/bell.png",
          title: "秒杀助手提醒",
          message:
            task.title +
            "\n将在2分钟后开始，请检查登录及商品规格选择验证码等！",
          buttons: [{ title: "切换Tab抢购页面" }, { title: "忽略" }]
        });
      } else {
        // 已经打开且激活
        let opt = {
          type: "basic",
          iconUrl: "image/bell.png",
          title: "秒杀助手提醒",
          message:
            task.title + "\n将在2分钟后开始，请检查登录及商品规格选择验证码等！"
        };
        chrome.notifications.create((++dialogId).toString(), opt);
      }
    }
  });
}

function startTask(task) {
  // 异步执行点击事件
  chrome.tabs.query({ url: task.url }, function(tabs) {
    // chrome.tabs.query({ title: task.title }, function(tabs) {
    if (tabs !== undefined && tabs.length > 0) {
      let tabId = tabs[0].id;

      chrome.tabs.executeScript(tabId, {
        code: "secKill(" + task.id + ");"
      });
      let opt = {
        type: "basic",
        title: "秒杀助手提醒",
        message: task.title + "\n秒杀任务完成！",
        iconUrl: "image/bell.png"
      };
      chrome.notifications.create((++dialogId).toString(), opt);
    } else {
      console.info("没有找到页面: " + task.url);
    }
  });
}
