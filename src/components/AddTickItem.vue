<template>
    <div>
        <el-button @click="addTickItem"  type="primary"><i class="el-icon-plus"></i></el-button>
        <div v-show="detail">
            <el-form ref="form" :rules="rules" :model="task" label-width="80px">
                <el-form-item label="任务名字" prop="name">
                    <el-input v-model="task.name" placeholder="输入任务名" style="width: 60% "></el-input>
                </el-form-item>
                <el-form-item label="打卡时间" required>
                    <el-date-picker type="date" placeholder="选择日期" v-model="task.date" style="width: 50%;"></el-date-picker>
                </el-form-item>
                <el-form-item label="打卡周期" required>
                    <el-select v-model="task.period" style="width: 50%" placeholder="打卡周期">
                        <el-option label="仅一次" value="once"></el-option>
                        <el-option label="每天" value="everyday"></el-option>
                        <el-option label="每周" value="weekly"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="任务详情">
                    <el-input type="textarea" v-model="task.describe" style="width: 60%"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button @click="onSubmit">添加</el-button>
                    <el-button @click="onCancel">取消</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
    import * as util from '../tutil/util'
    export default {
        name: "AddTickItem",
        data: function () {

            return {
                detail: false,
                task: {
                    name: "",
                    date: util.getToday(),
                    describe: "",
                    period: "everyday",
                    isTickedToday: false,
                },
                rules: {
                    name: [
                        {required: true, message: '请输入任务名', trigger: 'blur'},
                        {min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            addTickItem: function () {
                this.$data.detail = true;
            },
            onCancel: function() {
                this.$data.detail = false;
                this.$data.task = {
                    name: "",
                    date: util.getToday(),
                    describe: "",
                    period: "everyday",
                    isTickedToday: false,
                }
            },
            onSubmit: function () {
                this.$http.post("http://www.darktalk.cn/api/addTickTask",
                    {
                        telephone:this.$cookies.get('telephone'),
                        sessionId: this.$cookies.get('sessionId'),
                        name: this.$data.task.name,
                        date: this.$data.task.date,
                        describe: this.$data.task.describe,
                        period: this.$data.task.period,
                    },
                    {
                        headers: {"Content-Type": "application/json; charset=utf-8"},
                    }
                ).then(function (response) {
                    console.log("response:", response);
                    if (response.status === 200 && response.data.retCode === 0) {
                        location.reload();
                    } else {
                        console.log(JSON.stringify(response));
                    }
                }).catch(function (error) {
                    console.log(error);
                });
            }
        }
    }
</script>

<style scoped>

</style>