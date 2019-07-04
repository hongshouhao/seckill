import md5 from "md5";
import layer from "../layer/layer";
export default {
    methods: {
        onDomClick() {
            let csspath = this.generateCssSelector(this.selectedEl);
            if (!this.isSelectedExcludeEl) {
                let len = this.selectedElList.length;
                let name = "column" + len++;
                let color = this.propertyColors[this.colorIndex++ % this.propertyColors.length];
                let item = {
                    name: name, //名称
                    path: csspath, //csspath
                    color: color, //选中后的颜色
                    selectType: 'label', //获得元素的类型 text：文本 label:带标签
                    is_exclude_el: false, //排除内部元素
                    exclude_els: [] //排除的元素集合
                };
                let uniquecode = md5(JSON.stringify(item));
                if (this.selectedElList.filter(function(val) {
                        return val.uniquecode == uniquecode;
                    }).length == 0) {
                    item.uniquecode = uniquecode;
                    this.selectedElList.push(item);
                } else {
                    layer.msg("当前元素已经添加过了！", {
                        zIndex: 2147483620,
                        time: 3000,
                        icon: 2
                    });
                }
            } else {
                this.selectedElList[this.currentItemIndex]['exclude_els']['push'](csspath);
            }
            this.lastSelectedElList = this.selectedElList;
        }
    }
}