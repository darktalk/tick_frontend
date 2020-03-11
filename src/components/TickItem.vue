<template>
    <div class="ItemElem">
        <div>
            <span class="taskName" v-on:click="tick" v-bind:class="[tickTask.isTickedToday ? 'tickTask' : 'unTickTask']">
                {{number + 1}}. {{ taskInfo.name }}
            </span>
            <el-switch
                    v-model="detail"
                    active-color="#13ce66"
                    inactive-color="#909399">
            </el-switch>
        </div>

        <div v-show="detail">
                <el-form ref="form" :rules="rules" :model="tickTask" label-width="80px">
                    <el-form-item label="任务名字" prop="name">
                        <el-input v-model="tickTask.name" placeholder="输入任务名" style="width: 100% "></el-input>
                    </el-form-item>
                    <el-form-item label="打卡时间" required>
                            <el-date-picker type="date" placeholder="选择日期" v-model="tickTask.date" style="width: 100% " ></el-date-picker>
                    </el-form-item>
                    <el-form-item label="打卡周期" required>
                        <el-select v-model="tickTask.period" placeholder="打卡周期" style="width: 100% ">
                            <el-option label="仅一次" value="once"></el-option>
                            <el-option label="每天" value="everyday"></el-option>
                            <el-option label="每周" value="weekly"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="任务详情">
                        <el-input type="textarea" v-model="tickTask.describe" style="width: 100% "></el-input>
                    </el-form-item>
                        <el-button @click="onSubmit">修改</el-button>
                        <el-button @click="onDelete">删除</el-button>
                        <el-button @click="onCancel">取消</el-button>
                </el-form>
        </div>
    </div>
</template>

<script>
    import * as util from '../tutil/util'
    export default {
        name: 'TickItem',
        props: {
            taskInfo: Object,
            number: Number,
        },
        data: function() {
              return {
                  tickTask: {
                      taskId: this.$props.taskInfo.taskId,
                      name: this.$props.taskInfo.name,
                      date: this.$props.taskInfo.date,
                      describe: this.$props.taskInfo.describe,
                      period: this.$props.taskInfo.period,
                      isTickedToday: this.$props.taskInfo.isTickedToday,
                  },
                  detail: false,
                  rules: {
                      name: [
                          {required: true, message: '请输入任务名', trigger: 'blur'},
                          {min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur'}
                      ]
                  }
              }
        },
        methods: {
            httpRequest: function(url, data, successCallback, failCallback) {
                this.$http.post(url,
                    data,
                    {
                        headers: {"Content-Type": "application/json; charset=utf-8"},
                    }
                ).then(function (response) {
                    console.log("call url:", url);
                    console.log("response:", response);
                    if (response.status === 200 && response.data.retCode === 0) {
                        successCallback();
                    } else {
                        console.log(JSON.stringify(response));
                        failCallback();
                    }
                }).catch(function (error) {
                    console.log(error);
                    failCallback();
                });
            },
            onDelete: function() {
                let data = {
                    telephone: this.$cookies.get('telephone'),
                    sessionId: this.$cookies.get('sessionId'),
                    taskId: this.$data.tickTask.taskId,
                };
                let url = "http://www.darktalk.cn/api/removeTickTask";
                this.httpRequest(url, data, () => {
                    location.reload();
                }, () => {
                    util.notify(this, '删除打卡条目失败，请刷新页面重试');
                });
            },

            onSubmit: function () {
                this.$props.taskInfo.name = this.$data.tickTask.name;
                this.$props.taskInfo.date = this.$data.tickTask.date;
                this.$props.taskInfo.describe = this.$data.tickTask.describe;
                this.$props.taskInfo.period = this.$data.tickTask.period;
                this.$props.taskInfo.detail = this.$data.tickTask.detail;
                this.$data.detail = false;

                let url = "http://www.darktalk.cn/api/updateTickTask";
                let data = {
                        telephone: this.$cookies.get('telephone'),
                        sessionId: this.$cookies.get('sessionId'),
                        id: this.$data.tickTask.taskId,
                        name: this.$data.tickTask.name,
                        date: this.$data.tickTask.date,
                        describe: this.$data.tickTask.describe,
                        period: this.$data.tickTask.period
                    };
                this.httpRequest(url, data, () => {
                    util.notify(this, '更新成功');
                }, () => {
                    util.notify(this, '更新失败，请刷新页面重试');
                });
            },
            onCancel: function () {
                this.$data.tickTask.name = this.$props.taskInfo.name;
                this.$data.tickTask.date = this.$props.taskInfo.date;
                this.$data.tickTask.describe = this.$props.taskInfo.describe;
                this.$data.tickTask.period = this.$props.taskInfo.period;
                this.$data.tickTask.detail = this.$props.taskInfo.detail;
                this.$data.detail = false;
            },
            tick: function () {
                this.$data.tickTask.isTickedToday = !this.$data.tickTask.isTickedToday;
                this.$props.taskInfo.isTickedToday = this.$data.tickTask.isTickedToday;
                this.$data.detail = false;
                let date = util.getToday();
                let type = "remove";
                if (this.$data.tickTask.isTickedToday) {
                    type = "add";
                }
                let data = {
                    telephone: this.$cookies.get('telephone'),
                    sessionId: this.$cookies.get('sessionId'),
                    taskId: this.$data.tickTask.taskId,
                    date: date,
                    type: type
                };
                let url = "http://www.darktalk.cn/api/updateTickRecord";
                this.httpRequest(url, data,  () => {
                    // 发送打卡成功信号，进行刷新日期
                    this.$emit('tickTask', this.$data.tickTask.name, date, this.$data.tickTask.isTickedToday);
                }, () => {
                    util.notify(this, '打卡失败，请刷新页面重试');
                });
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .tickTask {
        text-decoration:line-through
    }
    .unTickTask {
        text-decoration:none
    }
    .taskName {
        alignment: left;
        text-align: left;
        font-weight: bold;
        font-size: 20px;
        color: black;
    }
</style>
