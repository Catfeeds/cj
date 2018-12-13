//app.js
var md5 = require('./utils/md5.js');
App({
    onLaunch: function (options) {
        // 登录
        var _this = this;
        wx.request({
            url: this.globalData.server_url + 'xcx/index/api_upload_qiniu_get_token',
            success(data) {
                _this.globalData.qiniu = data.data.data;
            }
        })
    },
    login:function(){
        var _this = this;
        if (wx.getStorageSync('openid')){
            return new Promise(function (resolve, reject){
                resolve();
            })
        }
        else{
            return new Promise(function (resolve, reject){
                wx.login({
                    success: function (res) {
                        wx.request({
                            url: _this.globalData.server_url + 'xcx/user/api_login',
                            data: {
                                'js_code': res.code
                            },
                            method: 'POST',
                            success(res) {
                                if (res.data.error_code == 0) {
                                    console.log(res.data.data.flag_get_unionid);
                                    wx.setStorageSync('flag_get_unionid', res.data.data.flag_get_unionid);
                                    wx.setStorageSync('openid', res.data.data.ret.openid);
                                    wx.setStorageSync('session_key', res.data.data.ret.session_key);
                                }
                            },
                            complete:function(){
                                resolve();
                            }
                        }) 
                    },
                    fail: function (res) { },
                    complete: function (res) { 
                    }
                   
                })
            })
        }
    },
    updateUnionid:function(){
        var _this = this;
        var flag_get_unionid = wx.getStorageSync('flag_get_unionid');
        console.log('77777+++'+flag_get_unionid)
        if (flag_get_unionid !== 0){
            return new Promise(function (resolve, reject){
                wx.login({
                    success: function (res) {
                        console.log(0)
                        wx.request({
                            url: _this.globalData.server_url + 'xcx/user/api_login',
                            data: {
                                'js_code': res.code
                            },
                            method: 'POST',
                            success(res) {
                                console.log(1)
                                if (res.data.error_code == 0) {
                                    wx.setStorageSync('flag_get_unionid', res.data.data.flag_get_unionid);
                                    wx.setStorageSync('openid', res.data.data.ret.openid);
                                    wx.setStorageSync('session_key', res.data.data.ret.session_key);
                                    if (flag_get_unionid == 1){
                                        wx.getUserInfo({
                                            success: function (res2) {
                                                console.log(1.1)
                                                var openid = wx.getStorageSync('openid');
                                                var session_key = wx.getStorageSync('session_key');
                                                var sendtime = Date.parse(new Date());
                                                var pwrand = parseInt(Math.random() * (99999 - 10000 + 1) + 10000);
                                                var pwstr = md5.hex_md5(openid + sendtime + 'ebuNOvBiakyTgLaAjsGeAmVwYLNaKSUB' + pwrand);
                                                wx.request({
                                                    url: _this.globalData.server_url + 'xcx/user/api_update_unionid',
                                                    data: {
                                                        'openid': openid,
                                                        'iv': encodeURIComponent(res2.iv),
                                                        'session_key': session_key,
                                                        'encryptedData': res2.encryptedData,
                                                        'sendtime': sendtime,
                                                        'pwrand': pwrand,
                                                        'pwstr': pwstr
                                                    },
                                                    method: 'POST',
                                                    success(data) {
                                                        console.log(1.2)
                                                        if (data.data.error_code == 0) {
                                                            wx.setStorageSync('flag_get_unionid', 0);
                                                        }
                                                    },
                                                    complete() {
                                                        resolve();
                                                    }
                                                })
                                            }
                                        })
                                    }
                                    else{
                                        resolve();
                                    }
                                }
                            }
                        })
                    },
                    fail: function (res) { },
                    complete: function (res) {
                    }
                })
            })  
        }
        else{
            return new Promise(function (resolve, reject){
                resolve();
            })
        }
    },
    globalData: {
        img_domain:'https://hdhfile.nbguohe.top/',
        qiniu:'',
        huodong_id:'42',
        invite_user_openid:{},
        userInfo: null,
        userInfo_flag:true,
        server_url:'https://cj.nbguohe.top/index.php/'
    }
})