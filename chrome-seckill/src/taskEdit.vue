<template>
  <div>
    <Select v-model="slctedTemplName" @on-change="slctedTemplChanged">
      <Option v-for="(item, idx) in templs" :value="item.name" :key="idx">{{ item.name }}</Option>
    </Select>
    <Form :model="innerTask" label-position="top">
      <FormItem label="商品">
        <Input v-model="innerTask.title" />
      </FormItem>
      <FormItem label="地址">
        <Input v-model="innerTask.url" />
      </FormItem>
      <Row>
        <Col span="12">
          <FormItem label="KillTime">
            <DatePicker type="datetime" @on-change="killTimeSelected" :value="innerTask.killTime"></DatePicker>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="Frequency">
            <Input v-model="innerTask.frequency" number />
          </FormItem>
        </Col>
      </Row>

      <!-- <FormItem label="选择器类型">
        <RadioGroup v-model="innerTask.selectorType">
          <Radio label="jQuery">jQuery</Radio>
          <Radio label="XPath">XPath</Radio>
        </RadioGroup>
      </FormItem>-->
      <FormItem label="页面-选择器" label-position="top">
        <vjsoneditor v-model="innerTask.pages" style="height:400px" :plus="false" />
      </FormItem>
    </Form>
  </div>
</template>
<script>
import axios from "axios";
import isJson from "is-json";
import fecha from "fecha";
import vjsoneditor from "v-jsoneditor";
import funcenv from "./funcenv";
export default {
  data() {
    return {
      innerTask: {
        url: "http://",
        pages: [],
        killTime: fecha.format(new Date(), "YYYY-MM-dd HH:mm:ss"),
        frequency: 100,
        status: 0
      },
      chromeurl: "http://",
      templs: [],
      slctedTemplName: ""
    };
  },
  props: {
    task: {
      url: {
        type: String
      },
      selectorType: {
        type: String
      },
      pages: {
        type: Array,
        default: []
      },
      killTime: {
        type: String
      },
      frequency: {
        type: Number,
        default: 100
      },
      status: {
        type: Number,
        default: 0
      }
    }
  },
  mounted() {
    let _this = this;
    _this.loadTempls();

    chrome.tabs.query(
      {
        active: true,
        windowId: chrome.windows.WINDOW_ID_CURRENT
      },
      function(tabs) {
        if (tabs && tabs[0]) {
          _this.chromeurl = tabs[0].url;
        }
      }
    );
  },
  computed: {},
  watch: {
    task(val) {
      this.innerTask = val;
    }
  },
  methods: {
    loadTempls() {
      let _this = this;
      let jsonURL = funcenv.templURL();
      console.info(jsonURL);
      axios
        .get(jsonURL)
        .then(function(response) {
          _this.templs = response.data;
          console.info(_this.templs);
        })
        .catch(function(reason) {
          console.error("加载任务列表失败: " + reason);
        });
    },

    slctedTemplChanged() {
      let _this = this;
      console.info("选择模板：" + _this.slctedTemplName);
      for (let i = 0; i < _this.templs.length; i++) {
        if (_this.slctedTemplName === _this.templs[i].name) {
          console.info(_this.templs[i]);
          _this.innerTask.pages = _this.templs[i].model.pages;
          _this.innerTask.frequency = _this.templs[i].model.frequency;
          break;
        }
      }
    },

    killTimeSelected(val) {
      this.innerTask.killTime = val;
    }
  },
  components: {
    vjsoneditor
  }
};
</script>
