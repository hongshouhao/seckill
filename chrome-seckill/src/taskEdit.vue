<template>
  <div>
    <Form :model="innerTask"
          label-position="left"
          :label-width="80">

      <FormItem label="地址">
        <Input v-model="innerTask.url" />
      </FormItem>
      <FormItem label="选择器类型">
        <RadioGroup v-model="innerTask.selectorType">
          <Radio label="jQuery">jQuery</Radio>
          <Radio label="XPath">XPath</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="页面-选择器">
        <vjsoneditor v-model="innerTask.pages"
                     :plus="false"
                     @error="onError" />
      </FormItem>
      <Row>
        <Col span=22>
        <p>{{msg}}</p>
        </Col>
        <Col span=1>
        <Button type="success"
                size="small"
                @click="ok">检查</Button>
        </Col>
      </Row>

      <FormItem label="KillTime">
        <DatePicker type="datetime"
                    v-model="innerTask.killTime"></DatePicker>
      </FormItem>
      <FormItem label="Frequency">
        <Input v-model="innerTask.frequency"
               number />
      </FormItem>
      <FormItem label="tryCount">
        <Input v-model="innerTask.tryCount"
               number />
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
        pages: [{
          name: '',
          doms: ['selector1', 'selector2']
        }],
        killTime: new Date(),
        frequency: 500,
        tryCount: 10
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
      this.innerTask.pagesJson = JSON.stringify(val.pages)
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
