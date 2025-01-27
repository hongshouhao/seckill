(function() {
  var task = {
    doms: [
      {
        xpath: '//*[@id="J_SelectAll1"]',
        type: "div"
      },
      {
        xpath: '//*[@id="J_Go"]',
        type: "a"
      }
    ]
  };
  var taskTimer = null;
  setTimeout(() => {
    if (taskTimer !== null) {
      clearInterval(taskTimer);
    }
  }, 10000);
  taskTimer = dealTask(task);
})();

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
  var step1TryCount = 0;
  var taskTimer = setInterval(function() {
    // if (task.currentPage !== document.title) {
    step1TryCount++;
    console.info("尝试查找次数: " + step1TryCount);
    for (var j = 0; j < task.doms.length; j++) {
      var dom = task.doms[j];
      var eles = getElementsByXPath(dom.xpath);
      if (eles.length === 0) {
        console.info("没有找到元素: " + dom.xpath);
        break;
      }
      var e = eles[0];
      if (e.getAttribute("type") === "checkbox") {
        e.setAttribute("checked", true);
      } else {
        e.click();
        console.info("执行成功");
      }
    }

    if (step1TryCount === 21) {
      console.info("尝试查找两次后刷新");
      document.location.reload();
    }
  }, 100);

  return taskTimer;
}
