export default {
    watch: {
        selectedElList: {
            handler(els) {
                let that = this;
                //删除所有已选元素外面的层
                this.lastSelectedElList.forEach(el => {
                    that.clearSelectedDom(el);
                });
                els.forEach(el => {
                    that.addSelectedDom(el);
                });
            },
            deep: true
        }
    }
}