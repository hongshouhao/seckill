import axios from "axios";

const forDev = {
  templURL: function() {
    return "static/templ.json";
  },
  loadTasks: callback => {
    axios
      .get("static/tasks.json")
      .then(function(response) {
        callback(response.data);
      })
      .catch(function(reason) {
        console.error("加载任务列表失败: " + reason);
      });
  }
};

const forProd = {
  templURL: function() {
    return chrome.runtime.getURL("templ.json");
  },
  loadTasks: callback => {
    chrome.storage.local.get({ tasks: [] }, function(value) {
      callback(value.tasks);
    });
  }
};

var expObj = null;
if (process.env.NODE_ENV === "production") {
  expObj = forProd;
} else {
  expObj = forDev;
}

export default expObj;
