
var md5 = require('../../utils/md5.js');
var app = getApp();

var openid,sendtime,pwrand,pwstr;

Page({
    data: {
        tabbar_data:{
            userInfo_flag: app.globalData.userInfo_flag,
            tab_index:'0'
        },
        myopacity:1,
        mydisplay:'block',
        page:1,
        hasNext:true,
        page_num:4,
        img_domain: app.globalData.img_domain,
        huodongs:[],
        canyu:{}
    },
    onLoad: function (query) {
        // wx.clearStorageSync()
        if (query.huodongid) {
            app.globalData.huodong_id = query.huodongid;
            app.globalData.invite_user_openid[query.huodongid] = query.openid;
            wx.navigateTo({ url: '../choujiang_xiangqing/choujiang_xiangqing' });
        }
        var _this = this;
        this.setData({myopacity:0});
        setTimeout(function () {
            _this.setData({ mydisplay: 'none' });
        }, 600)
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo']){
                    _this.setData({ 'tabbar_data.userInfo_flag': res.authSetting['scope.userInfo']});
                }
                else{
                    _this.setData({ 'tabbar_data.userInfo_flag': false });
                }
            }
        })
        wx.hideTabBar();

        app.login().then(
            function(){
                openid = wx.getStorageSync('openid');
                sendtime = Date.parse(new Date());
                pwrand = parseInt(Math.random() * (99999 - 10000 + 1) + 10000);
                pwstr = md5.hex_md5(openid + sendtime + 'ebuNOvBiakyTgLaAjsGeAmVwYLNaKSUB' + pwrand);
                wx.request({
                    url: app.globalData.server_url + 'xcx/index/api_get_huodong_list',
                    method: 'POST',
                    data: {
                        'page': _this.data.page,
                        'page_num': _this.data.page_num,
                        'openid': openid,
                        'sendtime': sendtime,
                        'pwrand': pwrand,
                        'pwstr': pwstr
                    },
                    success(data) {
                        if (data.data.error_code == 0) {
                            console.log(data.data.data.canyu)
                            _this.setData({
                                page: _this.data.page + 1,
                                huodongs: data.data.data.data,
                                canyu: data.data.data.canyu
                            })
                            if (data.data.data.total <= data.data.data.current_page * data.data.data.per_page) {
                                _this.setData({
                                    hasNext: false
                                })
                            }
                        }
                    }
                })
            }
        )
    },
    onPullDownRefresh:function(){
        var _this = this;
        this.setData({
            page: 1,
            hasNext: true
        })
        wx.request({
            url: app.globalData.server_url + 'xcx/index/api_get_huodong_list',
            method: 'POST',
            data: {
                'page': _this.data.page,
                'page_num': _this.data.page_num,
                'openid': openid,
                'sendtime': sendtime,
                'pwrand': pwrand,
                'pwstr': pwstr
            },
            success(data) {
                if (data.data.error_code == 0) {
                    console.log(data.data.data.canyu)
                    _this.setData({
                        page: _this.data.page + 1,
                        huodongs: data.data.data.data,
                        canyu: data.data.data.canyu
                    })
                    if (data.data.data.total <= data.data.data.current_page * data.data.data.per_page) {
                        _this.setData({
                            hasNext: false
                        })
                    }
                }
            },
            complete(){
                wx.stopPullDownRefresh();
            }
        })
    },
    onReachBottom:function(){
        var _this = this;
        if(this.data.hasNext){
            wx.showLoading({
                title: '玩命加载中'
            })
            wx.request({
                url: app.globalData.server_url + 'xcx/index/api_get_huodong_list',
                method: 'POST',
                data: {
                    'page': _this.data.page,
                    'page_num': _this.data.page_num,
                    'openid': openid,
                    'sendtime': sendtime,
                    'pwrand': pwrand,
                    'pwstr': pwstr
                },
                success(data) {
                    if (data.data.error_code == 0) {
                        var arry = _this.data.huodongs.concat(data.data.data.data);
                        var canyu = _this.data.canyu;
                        for (var key in data.data.data.canyu){
                            canyu[key] = data.data.data.canyu[key];
                        }
                        _this.setData({
                            page: _this.data.page + 1,
                            huodongs: arry,
                            canyu: canyu
                        })
                        if (data.data.data.total <= data.data.data.current_page * data.data.data.per_page) {
                            _this.setData({
                                hasNext: false
                            })
                        }
                    }
                },
                complete(){
                    wx.hideLoading({
                        title: '玩命加载中'
                    });
                }
            })
        }
    },
    jumpToPage: function (event) {
        var myurl = event.currentTarget.dataset.url;
        var id = event.currentTarget.dataset.id;
        app.globalData.huodong_id = id;
        if (myurl != '../index/index') {
            wx.navigateTo({ url: myurl });
        }
    },
    jumpToTabPage: function (event){
        var myurl = event.currentTarget.dataset.url;
        if (myurl != '../index/index') {
            wx.switchTab({ url: myurl });
        }
    },
    bindGetUserInfo:function(e){
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