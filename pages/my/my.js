//index.js
var md5 = require('../../utils/md5.js');
var app = getApp();
var openid, sendtime, pwrand, pwstr;
Page({
    data: {
        tabbar_data: {
            userInfo_flag: app.globalData.userInfo_flag,
            tab_index: '2'
        },
        user_info:'',
        huodong_data:''
    },
    onLoad:function(){
        var _this = this;
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo']) {
                    _this.setData({ 'tabbar_data.userInfo_flag': res.authSetting['scope.userInfo'] });
                }
                else {
                    _this.setData({ 'tabbar_data.userInfo_flag': false });
                }
            }
        })
        app.login().then(
            function(){
                openid = wx.getStorageSync('openid');
                sendtime = Date.parse(new Date());
                pwrand = parseInt(Math.random() * (99999 - 10000 + 1) + 10000);
                pwstr = md5.hex_md5(openid + sendtime + 'ebuNOvBiakyTgLaAjsGeAmVwYLNaKSUB' + pwrand);
                wx.request({
                    url: app.globalData.server_url + 'xcx/user/api_get_fans_info',
                    method: 'POST',
                    data: {
                        'openid': openid,
                        'sendtime': sendtime,
                        'pwrand': pwrand,
                        'pwstr': pwstr
                    },
                    success(data) {
                        if (data.data.error_code == 0) {
                            console.log(data.data.data)
                            if (!data.data.data.avatarurl){
                                data.data.data.avatarurl = '../../images/my/default-headimg.png'
                            }
                            _this.setData({
                                user_info: data.data.data
                            })
                        }
                    },
                    complete(){
                        wx.stopPullDownRefresh();
                    }
                })
                wx.request({
                    url: app.globalData.server_url + 'xcx/user/get_my_huodong_data',
                    method: 'POST',
                    data: {
                        'openid': openid,
                        'sendtime': sendtime,
                        'pwrand': pwrand,
                        'pwstr': pwstr
                    },
                    success(data) {
                        if (data.data.error_code == 0) {
                            _this.setData({
                                huodong_data: data.data.data
                            })
                        }
                    },
                    complete() {
                        wx.stopPullDownRefresh();
                    }
                })
            }
        )
    },
    onPullDownRefresh: function () {
        this.onLoad();
    },
    jumpToPage: function (event) {
        var myurl = event.currentTarget.dataset.url;
        if(myurl != '../my/my'){
            wx.navigateTo({ url: myurl })
        }
    },
    jumpToTabPage: function (event) {
        var myurl = event.currentTarget.dataset.url;
        if (myurl != '../my/my') {
            wx.switchTab({ url: myurl });
        }
    },
    bindGetUserInfo: function (e) {
        var _this = this;
        wx.showLoading({
            title: '登录中...'
        })
        if (e.detail.userInfo) {
            //用户按了允许授权按钮
            app.updateUnionid().then(
                function () {
                    _this.setData({
                        'tabbar_data.userInfo_flag': true
                    })
                    wx.hideLoading({
                        title: '登录中...'
                    })
                }
            );
        } else {
            //用户按了拒绝按钮
        }
    }
})