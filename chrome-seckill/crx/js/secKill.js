/**
 * 根据任务ID获取任务，执行点击
 * @param taskId
 */
function secKill(taskId) {
  console.log("开始秒杀！");
  console.log(taskId);
  chrome.storage.local.get({ tasks: [] }, function(value) {
    tasks = value.tasks;
    if (tasks !== undefined && tasks !== null && tasks.length > 0) {
      dealTask(tasks[taskId]);
    }
  });
}

/**
 * 根据xPath查询节点
 * @param STR_XPATH
 * @returns {Array}
 */
function getElementsByXPath(STR_XPATH) {
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
function dealTask(task) {
  var timer = setInterval(function() {
    for (i = 0; i < task.pages.length; i++) {
      if (document.title === task.title || task.title === "") {
        if (task.step < i) {
          var page = task.pages[i];
          var allFind = true;
          for (j = 0; j < page.doms.length; j++) {
            var dom = page.doms[j];
            var eles = getElementsByXPath(dom.xpath);
            if (eles.length == 0) {
              allFind = false;
              break;
            }
            eles[0].click();
          }
          if (allFind) {
            task.step = i;
          } else {
            break;
          }
        }
      } else {
        task.title = document.title;
      }
    }

    if (task.pages.length - 1 === task.step) {
      clearInterval(timer);
    }
  }, task.frequency);
}
