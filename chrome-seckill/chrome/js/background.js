// 消息窗口ID
var dialogId = 0

// 需要打开激活的url
var tasks = null

// 旧的循环器
var oldTimer = null

// 检查准备工作URL自动打开（账号登录 商品规格选择 手工）
var tickTime = 120000 // 120000 2分钟

chrome.extension.onConnect.addListener(function (port) {
  console.log('Connected .....')
  port.onMessage.addListener(function (msg) {
    console.log('收到前台时间更新：' + msg)
    processTask(msg)
    port.postMessage('时间更新成功')
  })
})

/**
 * 每隔500ms去检查任务,异步处理任务
 */
function processTask (standerTime) {
  console.log('后端开启轮询任务！')

  if (oldTimer != null) {
    clearInterval(oldTimer)
  }

  chrome.storage.local.get({ tasks: [] }, function (value) {
    tasks = value.tasks
    if (tasks.length > 0) {
      let timer = setInterval(function () {
        standerTime += 500
        for (let i = 0; i < tasks.length; i++) {
          let task = tasks[i]
          if (task.status === 0) {
            let timeLeft = task.killTime - standerTime
            if (timeLeft >= tickTime && timeLeft <= tickTime + 600) {
              notifyBeforeStart(task)
            } else if (timeLeft >= 0 && timeLeft <= 600) {
              startTask(task)
            }
          }
        }
      }, 500)

      oldTimer = timer
    }
  })
}

/* Respond to the user's clicking one of the buttons */
chrome.notifications.onButtonClicked.addListener(function (notifId, btnIdx) {
  let taskId = notifId.split('-')[1]
  if (notifId.startsWith('openLinkNotify-')) {
    if (btnIdx === 0) {
      for (let i = 0; i < tasks.length; i++) {
        if (taskId === tasks[i].id) {
          chrome.tabs.create({ url: tasks[i].url })
          chrome.notifications.clear(notifId)
        }
      }
    } else if (btnIdx === 1) {
      chrome.notifications.clear(notifId, function () {
        console.log('忽略本次秒杀！')
      })
    }
  }
  if (notifId.startsWith('activeTabNotify-')) {
    if (btnIdx === 0) {
      for (let i = 0; i < tasks.length; i++) {
        if (taskId === tasks[i].id) {
          chrome.tabs.query({ url: tasks[i].url }, function (results) {
            chrome.tabs.update(results[0].id, { active: true }, function () {
              console.log('抢购页面被激活！')
            })
            chrome.notifications.clear(notifId)
          })
        }
      }
    } else if (btnIdx === 1) {
      chrome.notifications.clear('openLinkNotify', function () {
        console.log('抢购页面未被激活！')
        chrome.notifications.clear(notifId)
      })
    }
  }
})

function notifyBeforeStart (task) {
  // 秒杀开始提醒（检查是否打开相关标签页）没有提示打开
  chrome.tabs.query({ url: task.url }, function (tabs) {
    if (tabs.length === 0) {
      chrome.notifications.create('openLinkNotify-' + task.id, {
        type: 'basic',
        iconUrl: 'image/link.png',
        title: '秒杀助手提醒',
        message: task.name + '\n任务将在2分钟后开始，抢购页面尚未打开，是否前往相关页面！',
        buttons: [{ title: '打开抢购页面' }, { title: '忽略' }]
      })
    } else {
      let noActive = true
      for (let j = 0; j < tabs.length; j++) {
        if (tabs[j].active) {
          noActive = false
          break
        }
      }
      if (noActive) {
        // 已经打开但是未激活
        chrome.notifications.create('activeTabNotify-' + task.id, {
          type: 'basic',
          iconUrl: 'image/bell.png',
          title: '秒杀助手提醒',
          message: task.name + '\n将在2分钟后开始，请检查登录及商品规格选择验证码等！',
          buttons: [{ title: '切换Tab抢购页面' }, { title: '忽略' }]
        })
      } else {
        // 已经打开且激活
        let opt = {
          type: 'basic',
          iconUrl: 'image/bell.png',
          title: '秒杀助手提醒',
          message:
            task.name + '\n将在2分钟后开始，请检查登录及商品规格选择验证码等！'
        }
        chrome.notifications.create((++dialogId).toString(), opt)
      }
    }
  })
}

function startTask (task) {
  // 异步执行点击事件
  chrome.tabs.query({ url: task.url }, function (tabs) {
    if (tabs.length > 0) {
      let tabId = tabs[0].id

      chrome.tabs.executeScript(tabId, {
        code: 'secKill(' + task.id + ');'
      })
      let opt = {
        type: 'basic',
        title: '秒杀助手提醒',
        message: task.name + '\n秒杀任务完成！',
        iconUrl: 'image/bell.png'
      }
      chrome.notifications.create((++dialogId).toString(), opt)
    }
  })
}

processTask(new Date().getTime())