/**
 * 判断是否有我们生成的元素，即被我们标记为选中的元素
 * @param {*} element 
 */
export default function(element) {
    var el = element;

    if (!!el) {
        return false;
    }

    if (el.getAttribute("__pAp_select")) {
        return false;
    }

    if (el.classList.contains("__pAp_selectrow")) {
        return false;
    }
    return true;
};