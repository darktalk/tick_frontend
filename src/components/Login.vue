<template>
    <el-dialog
            title="登录"
            :visible.sync="loginDialogVisible"
            width="80%"
            :before-close="onCloseLoginDialog">
        <el-row>
            <el-col>
                <label for="telephone">手机号:  </label>
                <el-input id="telephone" type="tel" v-model="telephone" placeholder="输入手机号" style="width: 60%"></el-input>
            </el-col>
        </el-row>
        <el-row>
            <el-col>
                <label for="verifyCode">验证码:  </label>
                <el-input id = "verifyCode" :disabled="verifyCodeAvail" v-model="verifyCode" placeholder="输入验证码" style="width: 60%;"></el-input>
            </el-col>
        </el-row>
        <span slot="footer" class="dialog-footer">
                <el-button type="primary" v-if="verifyCodeAvail" @click="onGetVerifyCode">获取验证码</el-button>
                <el-button type="primary" @click="onLogin" v-else>登录</el-button>
                </span>
    </el-dialog>
</template>

<script>
    import * as util from '../tutil/util'
    export default {
        name: "Login",
        data: function () {
            let sessionId = this.$cookies.get('sessionId');
            let telephone = this.$cookies.get('telephone');
            let loginDialogVisible = false;

            // 如果压根就没注册过，就直接返回数据
            if (sessionId === undefined || sessionId === null || sessionId === "" ||
                    telephone === undefined || telephone === null || telephone === "") {
                loginDialogVisible = true;
                return {
                    telephone: telephone,
                    verifyCode: "",
                    verifyCodeAvail: true,
                    loginDialogVisible: loginDialogVisible,
                }
            } else {
                // 已经有cookie了，要验证是否有效
                return this.verifySessionId(
                    () => {
                        return {
                            telephone: telephone,
                            verifyCode: "",
                            verifyCodeAvail: false,
                            loginDialogVisible: false,
                        }
                    },  () => {
                        this.$cookies.set("telephone", "");
                        this.$cookies.set("sessionId", "");
                        location.reload();
                        return {
                            telephone: telephone,
                            verifyCode: "",
                            verifyCodeAvail: false,
                            loginDialogVisible: true,
                        }
                    });
            }
        },
        methods: {
            verifySessionId: function(successCallback, failCallback) {
                this.$http.post("http://www.darktalk.cn/api/verifySessionId",
                    {
                        telephone: this.$cookies.get('telephone'),
                        sessionId: this.$cookies.get('sessionId')
                    },
                    {
                        headers: {"Content-Type": "application/json; charset=utf-8"},
                    }
                ).then((response) => {
                    console.log("verify session id response:");
                    console.log(JSON.stringify(response));
                    if (response.status === 200 && response.data.retCode === 0) {
                        this.$emit('loginSuccess');
                        if (successCallback !== null) {
                            return successCallback();
                        }
                    } else {
                        console.log(JSON.stringify(response));
                        util.notify(this, '登录失败，请刷新页面重试');
                        if (failCallback !== null) {
                            return failCallback();
                        }
                    }
                }).catch((error) => {
                    console.log("login fail, error:", error);
                    console.log(error.status);
                    console.log(error.code);
                    util.notify(this, '登录失败，请刷新页面重试');
                    if (failCallback !== null) {
                        return failCallback();
                    }
                });
            },
            onLogin: function () {
                this.$http.post("http://www.darktalk.cn/api/verifyCode",
                    {
                        telephone: this.$data.telephone,
                        verifyCode: this.$data.verifyCode
                    },
                    {
                        headers: {"Content-Type": "application/json; charset=utf-8"},
                    }
                ).then((response) => {
                    console.log("login response:");
                    console.log(JSON.stringify(response));
                    if (response.status === 200 && response.data.retCode === 0) {
                        this.$cookies.set('sessionId', response.data.sessionId, 365 * 60 * 60 * 24);
                        this.$cookies.set('telephone', response.data.telephone, 365 * 60 * 60 * 24);
                        // 验证码确认成功后，走登录流程
                        this.verifySessionId(() => {
                           this.$data.loginDialogVisible = false;
                        }, () => {
                            this.$data.loginDialogVisible = true;
                        });
                    } else {
                        util.notify(this, '验证验证码失败，请刷新页面重试');
                        this.$data.loginDialogVisible = true;
                    }
                }).catch((error) => {
                    console.log("can't verify code, error:", error);
                    util.notify(this, '验证验证码失败，请刷新页面重试');
                    this.$data.loginDialogVisible = true;
                });
            },
            onCloseLoginDialog: function () {
                util.notify(this, '登录后会自动关闭');
            },

            /*
             * 点击获取验证码
             */
            onGetVerifyCode: function () {
                this.$http.post("http://www.darktalk.cn/api/getVerificationCode",
                    {
                        telephone: this.$data.telephone
                    },
                    {
                        headers: {"Content-Type": "application/json; charset=utf-8"},
                    }
                ).then((response) => {
                    if (response.status === 200) {
                        util.notify(this, '已发送验证码，请注意查收');
                        this.$data.verifyCodeAvail = false;
                    }
                }).catch((error) => {
                    console.log("can't get verification code, error:", error);
                    util.notify(this, '获取验证码失败，请刷新页面后重试');
                    this.$data.verifyCodeAvail = true;
                });
            }
        }
    }
</script>

<style scoped>

</style>