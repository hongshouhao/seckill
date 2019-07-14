<template>
  <div id="app" style="text-align:left">
    <RadioGroup v-model="timeSource" @on-change="switchTime">
      <Radio label="本地时间"></Radio>
      <Radio label="标准时间"></Radio>
      <Radio label="淘宝时间"></Radio>
    </RadioGroup>

    <Button type="primary" size="small" @click="newTask">[+]</Button>
    <Button type="primary" size="small" @click="togglePlugin">{{getOnOff()}}</Button>
    <Button type="error" size="small" @click="clearStorage">清空存储</Button>

    <div>{{timeToString(standerTime)}}</div>

    <Card :key="index" style="width:400px" v-for="(taskItem, index) in taskList">
      <div slot="title">{{taskItem.title}}</div>
      <div>URL：{{taskItem.url}}</div>
      <!-- <div>选择器类型: {{taskItem.selectorType}}</div> -->
      <div style="overflow:hidden;height:60px">选择器: {{JSON.stringify(taskItem.pages)}}</div>
      <div>秒杀时间：{{taskItem.killTime}}</div>
      <div>剩余时间：{{taskItem.leftTime}}</div>
      <div>秒杀频率：{{taskItem.frequency}}</div>
      <div>状态：{{taskItem.status}}</div>

      <ButtonGroup>
        <Button type="primary" @click="updateStatus(index,1)">启动</Button>
        <Button type="primary" @click="updateStatus(index,0)">暂停</Button>
        <Button type="primary" @click="editTask(taskItem)">修改</Button>
        <Button type="primary" @click="deleteTask(index)">删除</Button>
      </ButtonGroup>
    </Card>
    <div>
      <Modal v-model="editModal" title="任务编辑" @on-ok="saveTask()">
        <taskEdit ref="TaskEdit" :task="task" />
      </Modal>
    </div>
  </div>
</template> 
<script>
import axios from "axios";
import fecha from "fecha";
import taskEdit from "./taskEdit";
import funcenv from "./funcenv";

export default {
  name: "App",
  data() {
    return {
      fastTime: 600,
      timeSource: "本地时间",
      standerTime: new Date().getTime() + 600,
      oldTimer: null,
      taskList: [],
      editModal: false,
      isNew: false,
      task: {}
    };
  },

  computed: {},

  mounted() {
    this.switchTime();
    funcenv.loadTasks(this.loadTasks);
  },

  methods: {
    togglePlugin() {
      let _this = this;

      let port = chrome.extension.connect({
        name: "seckill"
      });

      port.onMessage.addListener(function(msg) {
        console.info("message from background：" + msg);
      });

      let bg = chrome.extension.getBackgroundPage();
      if (!bg.isRunning) {
        port.postMessage({ op: "start", time: _this.standerTime });
        console.info("post message 'start'");
      } else {
        port.postMessage({ op: "stop" });
        console.info("post message 'stop'");
      }
    },

    timeToString(time) {
      if (!time) {
        return;
      }
      let t = typeof time;
      if (t === "number") {
        return fecha.format(new Date(time), "YYYY-MM-DD HH:mm:ss");
      } else if (t === "object") {
        return fecha.format(time, "YYYY-MM-DD HH:mm:ss");
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
      if (this.timeSource === "本地时间") {
        this.useLocalTime();
      } else if (this.timeSource === "标准时间") {
        this.useTaboServerTime();
      } else if (this.timeSource === "淘宝时间") {
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
            taskItem.killTimeNumber - _this.standerTime + 1000
          );
        }
      }, 1000);
      _this.oldTimer = timer;
    },

    useLocalTime() {
      this.standerTime = new Date().getTime() + this.fastTime;
      this.updateTime();
    },

    useTaboServerTime() {},

    useServerTime() {
      let _this = this;
      let apiUrl =
        "https://sapi.k780.com/?app=life.time&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json&jsoncallback=data";
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

    getOnOff() {
      let bg = chrome.extension.getBackgroundPage();
      if (bg.isRunning) {
        return "停用";
      } else {
        return "启用";
      }
    },
    loadTasks(tasks) {
      this.taskList = tasks;
      console.info(this.taskList);
    },

    updateStatus(idx, status) {
      this.taskList[idx].status = status;
      chrome.storage.local.set({ tasks: this.taskList });
    },

    newTask() {
      this.isNew = true;
      this.task = {};
      this.editModal = true;
    },

    saveTask() {
      let _this = this;
      if (_this.isNew) {
        _this.taskList.push(_this.$refs.TaskEdit.innerTask);
      }

      for (let i = 0; i < _this.taskList.length; i++) {
        let task = _this.taskList[i];
        task.id = i;
        let type = typeof task.killTime;
        if (type === "string") {
          task.killTimeNumber = fecha
            .parse(task.killTime, "YYYY-MM-DD HH:mm:ss")
            .getTime();
        }
      }

      console.info(_this.taskList);
      chrome.storage.local.set({ tasks: _this.taskList });
    },

    editTask(taskToEdit) {
      this.isNew = false;
      this.task = taskToEdit;
      this.editModal = true;
    },

    deleteTask(index) {
      let _this = this;
      _this.taskList.splice(index, 1);
      chrome.storage.local.set({ tasks: _this.taskList });
    },

    clearStorage() {
      chrome.storage.local.set({ tasks: [] });
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
