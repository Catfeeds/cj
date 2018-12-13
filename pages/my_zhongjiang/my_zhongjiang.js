// pages/my_zhongjiang/my_zhongjiang.js
var md5 = require('../../utils/md5.js');
var app = getApp();
var openid, sendtime, pwrand, pwstr;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        nomore_flag:true,
        img_domain: app.globalData.img_domain,
        page: 1,
        page_num: 20,
        hasNext: true,
        huodongs: [],
        huodongs_info: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var _this = this;
        app.login().then(
            function () {
                openid = wx.getStorageSync('openid');
                sendtime = Date.parse(new Date());
                pwrand = parseInt(Math.random() * (99999 - 10000 + 1) + 10000);
                pwstr = md5.hex_md5(openid + sendtime + 'ebuNOvBiakyTgLaAjsGeAmVwYLNaKSUB' + pwrand);
                _this.getMyZhongjiang();
            }
        )
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.setData({
            page: 1,
            hasNext: true
        })
        this.getMyZhongjiang('pulldown');
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.getMyZhongjiang();
    },
    getMyZhongjiang: function (mytype) {
        if (this.data.hasNext) {
            wx.showLoading({
                title: '玩命加载中'
            })
            var _this = this;
            wx.request({
                url: app.globalData.server_url + 'xcx/user/get_my_zhongjiang',
                method: 'POST',
                data: {
                    'openid': openid,
                    'sendtime': sendtime,
                    'pwrand': pwrand,
                    'pwstr': pwstr,
                    'page': _this.data.page,
                    'page_num': _this.data.page_num
                },
                success(data) {
                    if (data.data.error_code == 0) {
                        _this.setData({
                            page: _this.data.page + 1
                        })
                        if (data.data.data.huodongs.total <= data.data.data.huodongs.current_page * _this.data.page_num) {
                            _this.setData({
                                hasNext: false
                            })
                        }
                        if (mytype == 'pulldown') {
                            var arry = data.data.data.huodongs.data;
                            var obj = {};
                        }
                        else {
                            var arry = _this.data.huodongs;
                            arry = arry.concat(data.data.data.huodongs.data);
                            var obj = _this.data.huodongs_info;
                        }
                        for (var key in data.data.data.huodongs_info) {
                            if (data.data.data.huodongs_info[key].imgs) {
                                data.data.data.huodongs_info[key].img = data.data.data.huodongs_info[key].imgs.split(';')[0];
                            }
                            obj[key] = data.data.data.huodongs_info[key];
                        }
                        _this.setData({
                            huodongs: arry,
                            huodongs_info: obj
                        })
                        if (_this.data.huodongs.length == 0) {
                            _this.setData({
                                nomore_flag: false
                            })
                        }
                    }
                },
                complete() {
                    if (mytype == 'pulldown') {
                        wx.stopPullDownRefresh();
                    }
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
        wx.navigateTo({ url: myurl });
    }
})