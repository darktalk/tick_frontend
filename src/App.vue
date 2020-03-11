<template>
    <el-container>
        <el-header style="background-color: azure; text-align: center; font-size: 40px;">小打卡</el-header>
        <el-main>
            <!--登录-->
            <Login v-on:loginSuccess='loginSuccess'></Login>
            <el-row>
                <el-col span="2"><div class="grid-content"></div></el-col>
                <el-col span="22">
                    <br>
                    <!--打卡组件单元-->
                    <TickItem v-for="(item,index) in tickItems" v-on:tickTask='tickTask' v-bind:taskInfo="item" v-bind:number="index" :key="index"></TickItem>

                    <br>
                    <br>
                    <AddTickItem></AddTickItem>
                </el-col>
            </el-row>

            <br>
            <br>

            <el-row>
                <el-col span="24">
                    <el-table
                            :data="tickedTable"
                            style="width: 100%; color: black; font-size: 15px; text-align: left">
                        <el-table-column
                                prop="date"
                                label="日期"
                                width="120">
                        </el-table-column>
                        <el-table-column
                                prop="task"
                                label="已打卡">
                        </el-table-column>
                    </el-table>
                </el-col>
            </el-row>
        </el-main>
    </el-container>
</template>

<script>
import TickItem from './components/TickItem.vue'
import Login from './components/Login.vue'
import AddTickItem from "./components/AddTickItem";
import * as util from './tutil/util'

export default {
  name: 'App',
  components: {
      'TickItem': TickItem,
      'Login': Login,
      'AddTickItem': AddTickItem,
  },
  data: function () {
    return {
        tickedTable: [],
        sessionId: this.$cookies.get('sessionId'),
        telephone: this.$cookies.get('telephone'),
        tickItems: []
    }
  },
    methods: {
      tickTask: function(name, date, type) {
          date = util.formatDate(date);
          console.log(name, date, type);
          let find = false;
          for (let i = 0; i < this.$data.tickedTable.length; i++) {
              if (date === this.$data.tickedTable[i]["date"]) {
                  let names = this.$data.tickedTable[i]["task"].split(";  ");
                  let index = names.indexOf(name);
                  if (type === true) {
                      if (index < 0) {
                          names.push(name);
                          this.$data.tickedTable[i]["task"] = names.join(";  ");
                      }
                  } else {
                      names.splice(index, 1);
                      this.$data.tickedTable[i]["task"] = names.join(";  ");
                  }
                  find = true;
                  break;
              }
          }
          if (find === false) {
              this.$data.tickedTable.push(
                  {
                      "date": date,
                      "task": name
                  }
              )
          }
          this.$data.tickedTable.sort((a, b) => (a.date < b.date) ? 1 : ((a.date > b.date) ? -1 : 0));
},
ifShowItem: function(task) {
          let date = util.getToday();
          let weekday = new Date().getDate();

          switch (task.period) {
              case "once":
                  console.log("第一:");
                  console.log(task.date);
                  console.log("第二:");
                  console.log(date);
                  return task.date === date;
              case "weekly":
                  return new Date(date).getDay() === weekday;
              case "everyday":
                  return true;
              default:
                  console.log("unknown period type,", task);
                  return false;
          }
      },
      loginSuccess: function () {
          this.$data.telephone = this.$cookies.get('telephone');
          this.$data.sessionId = this.$cookies.get('sessionId');

          this.$http.post("http://www.darktalk.cn/api/getTickTasks",
              {
                  telephone: this.$data.telephone,
                  sessionId: this.$data.sessionId
              },
              {
                  headers: {"Content-Type": "application/json; charset=utf-8"},
              }
          ).then((response) => {
              console.log("get tick task response:");
              console.log(JSON.stringify(response));
              if (response.status === 200 && response.data.retCode === 0) {
                  for (let task of response.data.tasks) {
                      console.log("get task from server:");
                      console.log(JSON.stringify(task));
                      console.log(this);
                      if (this.ifShowItem(task) === true) {
                          this.$data.tickItems.push(task);
                      }
                      // 更新日历表
                      for (let date of task.tickedDate) {
                          console.log("日期:", date);
                          let find = false;
                          for (let i = 0; i < this.$data.tickedTable.length; i++) {
                              if (date === this.$data.tickedTable[i]["date"]) {
                                  let value = this.$data.tickedTable[i]["task"];
                                  value += ";  ";
                                  value += task.name;
                                  this.$data.tickedTable[i]["task"] = value;
                                  find = true;
                                  break;
                              }
                          }
                          if (find === false) {
                              this.$data.tickedTable.push(
                                  {
                                  "date": date,
                                  "task": task.name
                              })
                          }
                      }
                      this.$data.tickedTable.sort((a, b) => (a.date < b.date) ? 1 : ((a.date > b.date) ? -1 : 0));
                  }
              } else {
                  util.notify(this, '请求数据失败，请刷新页面重试');
              }
          }).catch((error) => {
              console.log("can't get task from server", error);
              util.notify(this, '请求数据失败，请刷新页面重试');
          });
      }
    }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.el-row {
    margin-bottom: 20px;
}
.el-col {
    border-radius: 4px;
}
.grid-content {
    border-radius: 4px;
    min-height: 36px;
}
.is-selected {
    color: #1989FA;
}
</style>
