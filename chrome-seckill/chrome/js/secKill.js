/**
 * 根据任务ID获取任务，执行点击
 * @param taskId
 */
function secKill (taskId) {
  console.log("开始秒杀！");
  console.log(taskId);
  chrome.storage.local.get({ tasks: new Array() }, function (value) {
    tasks = value.tasks;
    if (tasks !== undefined && tasks !== null && tasks.length > 0) {
      for (var i = 0; i < tasks.length; i++) {
        if (taskId === tasks[i].id) {
          dealTask(tasks[i]);
        }
      }
    }
  });
}

/**
 * 根据xPath查询节点
 * @param STR_XPATH
 * @returns {Array}
 */
function getElementsByXPath (STR_XPATH) {
  var xresult = document.evaluate(
    STR_XPATH,
    document,
    null,
    XPathResult.ANY_TYPE,
    null
  );
  var xnodes = [];
  var xres;
  while ((xres = xresult.iterateNext())) {
    xnodes.push(xres);
  }
  return xnodes;
}

/**
 * 处理任务
 * @param task
 */
function dealTask (task) {
  var timer = setInterval(function () {
    for (i = 0; i < task.pages.length; i++) {
      if (document.location.url === task.url) {
        if (task.clicked === false) {
          var selectors = task.pages[i];
          for (j = 0; j < selectors.length; j++) {
            var eles = getElementsByXPath(selectors[j]);
            for (e = 0; e < eles.length; e++) {
              eles[e].click();
            }
          }
          task.clicked = true;
        }
      } else {
        task.pages.splice(0, 1);
        task.url = document.location.url;
      }
    }

    if (task.pages.length === 0) {
      clearInterval(timer);
    }
  }, task.frequency);
}
