<template>
  <div id="app" style="text-align:left">
    <Checkbox v-model="ifUseLocalTime" @change="switchTime">本地时间</Checkbox>
    <Button v-show="ifUseLocalTime===false" type="primary" size="small" @click="useServerTime">校准</Button>

    <Button type="primary" size="small" @click="newTask">[+]</Button>

    <p>{{timeToString(standerTime)}}</p>

    <Card :key="index" v-for="(taskItem, index) in taskList">
      <p slot="title">{{taskItem.title}}</p>
      <p>URL: {{taskItem.url}}</p>
      <p>选择器类型: {{taskItem.selectorType}}</p>
      <p>选择器: {{JSON.stringify(taskItem.pages)}}</p>
      <p>秒杀时间: {{timeToString(taskItem.killTime)}}</p>
      <p>剩余时间：{{taskItem.leftTime}}</p>
      <p>秒杀频率: {{taskItem.frequency}}</p>
      <p>秒杀次数: {{taskItem.tryCount}}</p>

      <ButtonGroup>
        <Button type="primary">启动</Button>
        <Button type="primary">暂停</Button>
        <Button type="primary" @click="editTask(taskItem)">修改</Button>
        <Button type="primary">删除</Button>
      </ButtonGroup>
    </Card>
    <div>
      <Modal v-model="editModal" title="新任务" @on-ok="ok">
        <taskEdit ref="TaskEdit" :task="task" />
      </Modal>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import fecha from "fecha";
import taskEdit from "./taskEdit";

export default {
  name: "App",
  data() {
    return {
      fastTime: 600,
      ifUseLocalTime: false,
      standerTime: new Date(),
      oldTimer: null,
      taskList: [],
      editModal: false,
      task: {}
    };
  },

  computed: {},

  mounted() {
    this.switchTime();
    this.loadTasks();
  },

  methods: {
    timeToString(time) {
      let t = typeof time;
      if (t === "number") {
        return fecha.format(new Date(time), "YYYY-MM-DD hh:mm:ss");
      } else if (t === "object") {
        return fecha.format(time, "YYYY-MM-DD hh:mm:ss");
      } else if (t === "string") {
        return time;
      }
    },

    getLeftTime(leftTime) {
      if (!isNaN(leftTime)) {
        if (leftTime <= 0) {
          return "00:00:00";
        } else {
          let date = new Date(null);
          date.setMilliseconds(leftTime);
          let result = date.toISOString().substr(11, 8);
          return result;
        }
      }
    },

    switchTime() {
      if (this.ifUseLocalTime === false) {
        this.useLocalTime();
      } else {
        this.useServerTime();
      }
    },

    updateTime() {
      let _this = this;
      if (_this.oldTimer != null) {
        clearInterval(_this.oldTimer);
      }
      let timer = setInterval(function() {
        _this.standerTime += 1000;
        for (let i = 0; i < _this.taskList.length; i++) {
          let taskItem = _this.taskList[i];
          taskItem.leftTime = _this.getLeftTime(
            taskItem.killTime - _this.standerTime + 1000
          );
        }
      }, 1000);
      _this.oldTimer = timer;

      // 更新Background的时间 开始
      // let port = chrome.extension.connect({
      //   name: "update standerTime"
      // });
      // port.postMessage(_this.standerTime);
      // port.onMessage.addListener(function (msg) {
      //   console.log("后台反馈：" + msg);
      // });
      // 更新Background的时间 结束
    },

    useLocalTime() {
      this.standerTime = new Date().getTime() + this.fastTime;
      this.updateTime();
    },

    useServerTime() {
      let _this = this;
      // 北京时间接口路径
      let apiUrl =
        "https://sapi.k780.com/?app=life.time&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json&jsoncallback=data";
      // 调用接口获取北京时间
      let startTime = new Date().getTime();

      axios
        .get(apiUrl)
        .then(function(response) {
          if (response.data.success !== "1") {
            console.error(response.data.msgid + " " + response.data.msg);
            console.error("调用接口获取北京时间失败！使用本机时间");
            _this.useLocalTime();
          } else {
            for (let i in response.data.result) {
              let property = response.data.result[i];
              if (i === "timestamp") {
                let time = parseInt(property + "000");
                let diff = (new Date().getTime() - startTime) / 2;
                _this.standerTime = time + diff + 500;
                _this.updateTime();
              }
            }
          }
        })
        .catch(function() {
          console.error("调用接口获取北京时间失败！使用本机时间");
          _this.useLocalTime();
        });
    },

    loadTasks() {
      let _this = this;
      axios
        .get("static/tasks.json")
        .then(function(response) {
          _this.taskList = response.data;
          console.info(_this.taskList);

          for (let i = 0; i < _this.taskList.length; i++) {
            let tsk = _this.taskList[i];
            tsk.id = i;
            let type = typeof tsk.killTime;
            if (type === "string") {
              tsk.killTime = fecha.parse(tsk.killTime, "YYYY-MM-DD hh:mm:ss");
            }
          }
        })
        .catch(function() {
          console.error("加载任务列表失败");
        });

      // chrome.storage.local.get({ tasks: [] }, function (value) {
      //   _this.taskList = value.tasks
      // })
    },

    newTask() {
      this.editModal = true;
    },
    ok() {
      let _this = this;
      console.info(_this.$TaskEdit.task);
      _this.taskList.push(_this.$TaskEdit.task);
      // chrome.storage.local.set({ tasks: _this.taskList })
    },
    editTask(taskToEdit) {
      this.task = taskToEdit;
      this.editModal = true;
    }
  },
  components: {
    taskEdit
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
