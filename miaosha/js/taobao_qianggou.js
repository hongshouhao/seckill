/**
 [
    {
      url: "file:///E:/_OpenSource/seckill2/chrome-seckill/src/test/page1.html",
      doms: [
        {
          xpath: '//*[text()="立即抢购"]',
          type: "a"
        }
      ],
      killTime: "2019-07-11 00:00:00",
    }
 ]
 */

(function() {
  var tasks = [
    {
      url:
        "https://detail.tmall.com/item.htm?spm=a1z10.1-b-s.w20203629-14888700750.7.10661a05W71PKA&id=598233871419",
      doms: [
        {
          xpath: '//*[text()="立即购买"]',
          type: "a"
        }
      ],
      killTime: "2019-07-08 21:59:57"
    }
  ];

  var task = null;
  for (var i = 0; i < tasks.length; i++) {
    var taskTemp = tasks[i];
    if (window.location.href.startsWith(taskTemp.url)) {
      task = taskTemp;
      break;
    }
  }
  if (task !== null) {
    task.time = new Date(task.killTime).getTime();
    var taskTimer = null;
    var timer = setInterval(function() {
      var leftTime = task.time - new Date().getTime();
      console.info(leftTime);

      if (-2000 > leftTime) {
        console.info("任务过期");
        clearInterval(timer);
        if (taskTimer != null) {
          clearInterval(taskTimer);
        }
      } else if (-2000 < leftTime && leftTime <= 5000) {
        console.info("执行任务");
        taskTimer = dealTask(task);
      } else {
        console.info("任务未到抢购时间");
      }
    }, 1000);
  } else {
    console.warn("没有找到Task");
  }
})();

function getText(url, callback) {
  var request = new XMLHttpRequest();
  var timeout = false;
  var timer = setTimeout(function() {
    timeout = true;
    request.abort();
  }, 5000);
  request.open("GET", url);
  request.onreadystatechange = function() {
    if (request.readyState !== 4) return;
    if (timeout) {
      console.error("获取任务列表超时");
      return;
    }
    clearTimeout(timer);
    if (request.status === 200) {
      callback(request.responseText);
    }
  };
  request.send(null);
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

    if (step1TryCount === 5) {
      console.info("尝试查找两次后刷新");
      document.location.reload();
    }
  }, 500);

  return taskTimer;
}
