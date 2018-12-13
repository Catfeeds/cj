// pages/share/share.js
var md5 = require('../../utils/md5.js');
var app = getApp();
var sys_info,r2;
wx.getSystemInfo({
    success(res) {
        sys_info = res;
        r2 = 750 / sys_info.screenWidth;
    }
})
const ctx = wx.createCanvasContext('mycanvas');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        img_domain: app.globalData.img_domain,
        desc:'',
        info:'',
        jiangpins:[],
        send_user:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        ctx.clearRect(0, 0, 750 / r2, 1500/r2);
        ctx.draw();
        var _this = this;
        var openid = wx.getStorageSync('openid');
        var sendtime = Date.parse(new Date());
        var pwrand = parseInt(Math.random() * (99999 - 10000 + 1) + 10000);
        var pwstr = md5.hex_md5(openid + sendtime + 'ebuNOvBiakyTgLaAjsGeAmVwYLNaKSUB' + pwrand);
        wx.request({
            url: app.globalData.server_url + 'xcx/index/api_get_one_huodong',
            method: 'POST',
            data: {
                'huodong_id': app.globalData.huodong_id,
                'openid': openid,
                'sendtime': sendtime,
                'pwrand': pwrand,
                'pwstr': pwstr
            },
            success(data) {
                if (data.data.error_code == 0) {
                    _this.setData({
                        desc: data.data.data.huodong.desc,
                        info: data.data.data.huodong.info,
                        jiangpins: data.data.data.huodong.jiangpins,
                        send_user: data.data.data.huodong.send_user
                    })
                    _this.generatePoster();
                }
            }
        })
    },
    generatePoster:function(){
        var _this = this;
        // wx.getImageInfo({
        //     src: _this.data.img_domain + _this.data.jiangpins[0].img,
        //     success(res) {
        ctx.rect(0, 0, 750 / r2, 1500 / r2);
        ctx.setFillStyle('#d8554d');
        ctx.fill();
        // ctx.draw()
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(750/r2/2, 65, 35, 0, 2 * Math.PI);
        // 从画布上裁剪出这个圆形
        ctx.clip();
        // ctx.drawImage(res.path, 0, 0, 70, 70);
        ctx.drawImage(_this.data.send_user.avatarurl, 750/r2/2-35, 30, 70, 70);
        ctx.restore();

        ctx.draw();
        //     }
        // })
    }
})