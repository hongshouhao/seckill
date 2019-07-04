export default {
    methods: {
        clearSelectedDom(selectedEl) {
            try {
                let that = this;
                let path = selectedEl.path;
                let exclude_els = selectedEl.exclude_els;
                document.querySelectorAll(path).forEach(function(el) {
                    el.style.boxShadow = "none";
                    el.removeAttribute(that.selectAttr);
                    el.removeAttribute("_data_index");
                    el.classList.remove(that.rowClass);
                });
                document.querySelectorAll(exclude_els.join(",")).forEach(function(el) {
                    el.classList.remove('__paApa_exclude_el');
                })
            } catch (error) {}
        },
        addSelectedDom(selectedEl) {
            try {
                let that = this;
                let path = selectedEl.path;
                let color = selectedEl.color;
                let exclude_els = selectedEl.exclude_els;
                document.querySelectorAll(path).forEach(function(el) {
                    let currentEl = el;
                    currentEl.style.boxShadow = "0 0 10px " + color + ",0 0 20px " + color + " inset";
                    currentEl.setAttribute(that.selectAttr, "1");
                });
                document.querySelectorAll(exclude_els.join(",")).forEach(function(el) {
                    el.classList.add('__paApa_exclude_el');
                })
            } catch (error) {

            }
        }
    }
}