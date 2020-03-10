import mousewheel from "element-ui/src/directives/mousewheel";

export function notify(obj, msg){
    const h = obj.$createElement;
    obj.$notify({
        message: h('i', {style: 'color: teal'}, msg)
    });
}

export function getToday(){
    let today = new Date();
    return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
}

export function formatDate(date) {
    let elems2 =  date.split("T")[0].split("-");
    let month = elems2[1];
    if (month.length === 1) {
        month = "0" + month;
    }
    let day = elems2[2];
    if (day.length === 1) {
        day = "0" + day;
    }
    return elems2[0] + "-" + month + "-" + day;
}

