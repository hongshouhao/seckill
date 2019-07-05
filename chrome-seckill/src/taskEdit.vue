<template>
  <div>
    <Form :model="innerTask"
          label-position="top">
      <FormItem label="地址">
        <Input v-model="innerTask.url" />
      </FormItem>
      <Row>
        <Col span="12">
        <FormItem label="KillTime">
          <DatePicker type="datetime"
                      v-model="innerTask.killTime"></DatePicker>
        </FormItem>
        </Col>
        <Col span="12">
        <FormItem label="Frequency">
          <Input v-model="innerTask.frequency"
                 number />
        </FormItem>
        </Col>
      </Row>

      <!-- <FormItem label="选择器类型">
        <RadioGroup v-model="innerTask.selectorType">
          <Radio label="jQuery">jQuery</Radio>
          <Radio label="XPath">XPath</Radio>
        </RadioGroup>
      </FormItem> -->
      <FormItem label="页面-选择器"
                label-position="top">
        <vjsoneditor v-model="innerTask.pages"
                     style="height:400px"
                     :plus="false"
                     @error="onError" />
      </FormItem>
    </Form>
  </div>
</template>
<script>
import isJson from 'is-json'
import vjsoneditor from 'v-jsoneditor/src/index'
export default {
  data () {
    return {
      innerTask: {
        url: 'http://',
        selectorType: 'XPath',
        pages: [
          {
            mark: '1',
            doms: [
              { xpath: 'selector1', type: 'chk' },
              { xpath: 'selector2', type: 'btn' }
            ]
          }
        ],
        killTime: new Date(),
        frequency: 100,
        status: 0
      },
      json: '',
      jsonValid: true,
      msg: '检查JSON格式是否合法'
    }
  },
  props: {
    task: {}
  },
  watch: {
    task (val) {
      this.innerTask = val
      debugger
    }
  },
  methods: {
    ok () {
      this.jsonValid = isJson(this.innerTask.pagesJson)
      if (this.jsonValid === true) {
        this.msg = 'JSON格式合法'
        this.task.pages = JSON.parse(this.innerTask.pagesJson)
      } else {
      }
    },
    onError () {
      this.msg = 'JSON格式非法'
    }
  },
  components: {
    vjsoneditor
  }
}
</script>
