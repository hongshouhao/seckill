/**
 * 根据任务ID获取任务，执行点击
 * @param taskId
 */
function secKill (taskId) {
  console.log('开始秒杀！')
  console.log(taskId)
  chrome.storage.local.get({ tasks: [] }, function (value) {
    var taskList = value.tasks
    if (taskList !== undefined && taskList !== null && taskList.length > 0) {
      dealTask(taskList[taskId])
    }
  })
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
  )
  var xnodes = []
  var xres
  while ((xres = xresult.iterateNext())) {
    xnodes.push(xres)
  }
  return xnodes
}

/**
 * 处理任务
 * @param task
 */
function dealTask (task) {
  task.step = 0
  var step1TryCount = 0

  var timer = setInterval(function () {
    // if (task.currentPage !== document.title) {
    if (task.pages.length > task.step) {
      if (task.step === 0) {
        step1TryCount++
      }

      var page = task.pages[task.step]
      var allFind = true
      for (var j = 0; j < page.doms.length; j++) {
        var dom = page.doms[j]
        var eles = getElementsByXPath(dom.xpath)
        if (eles.length === 0) {
          allFind = false
          break
        }
        var e = eles[0]
        if (e.getAttribute('type') === 'checkbox') {
          e.setAttribute('checked', true)
        } else {
          e.click()
        }
      }

      if (allFind) {
        task.step++
      } else {
        if (step1TryCount === 2) {
          document.location.reload()
        }
      }
    }

    // } else {
    //   task.currentPage = document.title
    // }

    if (task.pages.length === task.step) {
      clearInterval(timer)
    }
  }, task.frequency)
}
