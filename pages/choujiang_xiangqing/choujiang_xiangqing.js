// pages/choujiang_xiangqing/choujiang_xiangqing.js
var md5 = require('../../utils/md5.js');
var app = getApp();

var huodong_id;
var invite_user_openid;
var openid,sendtime,pwrand ,pwstr;

const ctx = wx.createCanvasContext('shareCanvas');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo_flag: app.globalData.userInfo_flag,
        img_domain: app.globalData.img_domain,
        desc:'',
        info:'',
        canvas_flag:true,
        thumb_img:'',
        content_imgs:[],
        jiangpins:[],
        send_user:'',
        myinfo:'',
        zhongjiangs:[],
        jiangpin_type_arry:{
            '1':'实体',
            '2':'虚拟',
            '3':'到店奖品'
        },
        qr_type_arry: ['个人微信号', '公众号', '小程序', '其他'],
        codes_info:{
            invite_users: [],
            codes:[]
        },
        uninvite_users: ['../../images/my/default.png', '../../images/my/default.png','../../images/my/default.png'],
        users:[],
        canyu_tips:'',
        canyu_tips2: '',
        actionSheet_posy:0,
        actionSheet_opa:0,
        bg_hidden_flag:true,
        navbar_flag:'1'
    },
    
    onLoad:function(){
        ctx.clearRect(0, 0, 250, 200);
        ctx.draw();
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userInfo']) {
                    _this.setData({ 'userInfo_flag': res.authSetting['scope.userInfo'] });
                }
                else {
                    _this.setData({ 'userInfo_flag': false });
                }
            }
        })
        invite_user_openid = '';
        huodong_id = app.globalData.huodong_id;
        if (app.globalData.invite_user_openid[huodong_id]){
            invite_user_openid = app.globalData.invite_user_openid[huodong_id];
        }
        console.log(invite_user_openid)
        var _this = this;
        app.login().then(
            function(){
                openid = wx.getStorageSync('openid');
                sendtime = Date.parse(new Date());
                pwrand = parseInt(Math.random() * (99999 - 10000 + 1) + 10000);
                pwstr = md5.hex_md5(openid + sendtime + 'ebuNOvBiakyTgLaAjsGeAmVwYLNaKSUB' + pwrand);
                wx.request({
                    url: app.globalData.server_url + 'xcx/index/api_get_one_huodong',
                    method: 'POST',
                    data: {
                        'huodong_id': huodong_id,
                        'openid': openid,
                        'sendtime': sendtime,
                        'pwrand': pwrand,
                        'pwstr': pwstr
                    },
                    success(data) {
                        if (data.data.error_code == 0) {
                            console.log(data)
                            if (data.data.data.huodong.info.content_imgs){
                                var imgs = data.data.data.huodong.info.content_imgs.split(';');
                            }
                            else{
                                var imgs = [];
                            }
                            if (!data.data.data.huodong.send_user.avatarurl){
                                data.data.data.huodong.send_user.avatarurl = '../../images/my/default-headimg.png';
                            }
                            _this.setData({
                                desc: data.data.data.huodong.desc,
                                info: data.data.data.huodong.info,
                                jiangpins: data.data.data.huodong.jiangpins,
                                send_user: data.data.data.huodong.send_user,
                                content_imgs: imgs,
                                myinfo: data.data.data.my
                            })
                            if (data.data.data.huodong.info.share_img){
                                _this.setData({
                                    thumb_img: data.data.data.huodong.info.share_img,
                                    canvas_flag: false
                                })
                            }
                            else{
                                _this.thumbImage();
                            }
                            
                            if (data.data.data.huodong.desc.state == '12'){
                                for (var i = 0; i < data.data.data.huodong.jiangpins.length;i++){
                                    _this.getOneZhongjiangInfo(data.data.data.huodong.jiangpins[i].huodong_jiangpin_id, data.data.data.huodong.desc.rand);
                                }
                            }
                            else{
                                _this.setData({
                                    navbar_flag: '2'
                                })
                            }
                        }
                    },
                    complete(){
                        wx.stopPullDownRefresh();
                    }
                })
                _this.getOneHuodongMyData();
                _this.getOneHuodongPeoples();
            }
        )
    },
    getOneZhongjiangInfo: function (jiangpin_id, rand){
        var _this = this;
        wx.request({
            url: app.globalData.server_url + 'xcx/index/api_get_one_zhongjiang_info',
            method: 'POST',
            data: {
                'huodong_id': app.globalData.huodong_id,
                'page': 1,
                'page_num': 9,
                'openid': openid,
                'sendtime': sendtime,
                'pwrand': pwrand,
                'pwstr': pwstr,
                'jiangpin_id': jiangpin_id,
                'rand': rand
            },
            success(data) {
                if (data.data.error_code == 0) {
                    var arry = _this.data.zhongjiangs;
                    for (var i = 0; i < data.data.data.zhongjiangs.data.length;i++){
                        if (!data.data.data.zhongjiangs.data[i].avatarurl){
                            data.data.data.zhongjiangs.data[i].avatarurl = '../../images/my/default-headimg.png';
                        }
                    }
                    arry.push(data.data.data.zhongjiangs.data);
                    _this.setData({
                        zhongjiangs: arry
                    })
                }
            }
        })
    },
    getOneHuodongPeoples: function () {
        var _this = this;
        wx.request({
            url: app.globalData.server_url + 'xcx/index/api_get_one_huodong_peoples',
            method: 'POST',
            data: {
                'huodong_id': app.globalData.huodong_id,
                'page': 1,
                'page_num': 20
            },
            success(data) {
                if (data.data.error_code == 0) {
                    for (var i = 0; i < data.data.data.users.data.length; i++) {
                        if (!data.data.data.users.data[i].avatarurl) {
                            data.data.data.users.data[i].avatarurl = '../../images/my/default-headimg.png'
                        }
                    }
                    var arry = data.data.data.users.data;
                    _this.setData({
                        users: arry
                    })
                }
            }
        })
    },
    onPullDownRefresh: function () {
        this.onLoad();
    },
    thumbImage:function(){
        var _this = this;
        wx.getImageInfo({
            src: _this.data.img_domain + _this.data.jiangpins[0].img,
            success(res) {
                // ctx.setLineWidth(5)
                // ctx.rect(0, 0, 250, 200)
                // ctx.setStrokeStyle('#FF6666')
                // ctx.stroke()
                ctx.drawImage(res.path, 0, 10, 250, 117);
                if (_this.data.desc.zanzu_flag == 1){
                    ctx.setFontSize(12) // 文字字号：22px
                    var metrics = ctx.measureText(_this.data.desc.zanzu);
                    ctx.setFillStyle('#666666')
                    ctx.fillRect(235 - metrics.width, 15, metrics.width + 10, 20)
                    ctx.setFillStyle('#ffffff') // 文字颜色：黑色
                    ctx.fillText(_this.data.desc.zanzu, 240 - metrics.width, 30)
                }

                ctx.setFillStyle('#666666') // 文字颜色：黑色
                ctx.setFontSize(16) // 文字字号：22px
                ctx.fillText('奖品：' + _this.data.jiangpins[0].jiangpin_text, 5, 155)

                ctx.setFillStyle('#999999') // 文字颜色：黑色
                ctx.setFontSize(14) // 文字字号：22px
                ctx.fillText(_this.data.desc.kaijiang_tiaojian, 5, 180)

                ctx.draw(false, function () {
                    wx.canvasToTempFilePath({
                        x: 0,
                        y: 0,
                        width: 250,
                        height: 200,
                        canvasId: 'shareCanvas',
                        success(res) {
                            // _this.setData({
                            //     thumb_img: res.tempFilePath
                            // })
                            _this.setData({
                                canvas_flag:false
                            })
                            wx.uploadFile({
                                url: 'https://up.qbox.me',
                                filePath: res.tempFilePath,
                                name: 'file',
                                formData: {
                                    'token': app.globalData.qiniu.token
                                },
                                success(res) {
                                    var obj = JSON.parse(res.data);
                                    _this.setData({
                                        thumb_img: obj.key
                                    })
                                    wx.request({
                                        url: app.globalData.server_url + 'xcx/index/update_share_img',
                                        method: 'POST',
                                        data: {
                                            'huodong_id': huodong_id,
                                            'openid': openid,
                                            'sendtime': sendtime,
                                            'pwrand': pwrand,
                                            'pwstr': pwstr,
                                            'img': obj.key
                                        },
                                        success(data) {
                                            if (data.data.error_code == 0) {
                                            
                                            }
                                        }
                                    })
                                }
                            })
                        }
                    })
                });
            }
        })
    },
    getOneHuodongMyData:function(){
        var _this = this;
        wx.request({
            url: app.globalData.server_url + 'xcx/index/api_get_one_huodong_my_data',
            method: 'POST',
            data: {
                'huodong_id': huodong_id,
                'openid': openid,
                'sendtime': sendtime,
                'pwrand': pwrand,
                'pwstr': pwstr
            },
            success(data) {
                if (data.data.error_code == 0) {
                    console.log(data)
                    var arry = _this.data.uninvite_users;
                    arry.splice(0, data.data.data.invite_users.length)
                    for (var i = 0; i < data.data.data.invite_users.length;i++){
                        if (!data.data.data.invite_users[i].avatarurl){
                            data.data.data.invite_users[i].avatarurl = '../../images/my/wode-1.png'
                        }
                    }
                    _this.setData({
                        codes_info: data.data.data,
                        uninvite_users: arry
                    })
                    if (data.data.data.code_way_1 == 0){
                        _this.setData({
                            canyu_tips: '本次抽奖免费',
                            canyu_tips2: '剩余' + data.data.data.shengyu_coin + '金币'
                        })
                    }
                    else{
                        _this.setData({
                            canyu_tips: '本次抽奖需' + (Math.pow(data.data.data.coin_base, parseInt(data.data.data.code_way_2) + 1)) + '金币',
                            canyu_tips2: '剩余' + data.data.data.shengyu_coin + '金币'
                        })
                    }
                }
            }
        })
    },
    choujiang:function(e){
        var form_id = e.detail.formId;
        wx.showLoading({
            title: ''
        })
        var _this = this;
        if (openid == invite_user_openid){
            invite_user_openid = '';
        }
        app.updateUnionid().then(
            function(){
                console.log(2.0)
                wx.request({
                    url: app.globalData.server_url + 'xcx/index/api_choujiang',
                    method: 'POST',
                    data: {
                        'huodong_id': huodong_id,
                        'openid': openid,
                        'invite_user_openid': invite_user_openid,
                        'form_id': form_id,
                        'sendtime': sendtime,
                        'pwrand': pwrand,
                        'pwstr': pwstr
                    },
                    success(data) {
                        console.log(2)
                        wx.hideLoading({
                            title: ''
                        })
                        if (data.data.error_code == 0) {
                            _this.getOneHuodongMyData();
                            if (app.globalData.invite_user_openid[huodong_id]) {
                                app.globalData.invite_user_openid[huodong_id] = '';
                            }
                        }
                        else {
                            wx.showToast({
                                title: data.data.error_message,
                                icon: 'none',
                                duration: 2000
                            })
                        }
                    },
                    fail() {
                        wx.hideLoading({
                            title: ''
                        })
                    }
                })
            }
        )
    },
    backHome:function(){
        wx.switchTab({
            url: '../index/index'
        })
    },
    onShareAppMessage: function (res) {
        var _this = this;
        return {
            title: _this.data.send_user.nickname + '邀您参与[' + _this.data.jiangpins[0].jiangpin_text+']抽奖',
            path: 'pages/index/index?huodongid=' + huodong_id + '&openid=' + openid,
            imageUrl: _this.data.img_domain+_this.data.thumb_img
        }
    },
    listenerShareButton:function(){
        this.setData({
            actionSheet_posy: '-322rpx',
            actionSheet_opa: 1,
            bg_hidden_flag: false
        })
    },
    listenerCancleButton:function(){
        this.setData({
            actionSheet_posy: '0',
            actionSheet_opa: 0,
            bg_hidden_flag: true
        })
    },
    generatePoster: function () {
        wx.navigateTo({ url: '../share/share' });
    },
    bindGetUserInfo: function (e) {
        var _this = this;
        wx.showLoading({
            title: '登录中...'
        })
        if (e.detail.userInfo) {
            //用户按了允许授权按钮
            app.updateUnionid().then(
                function(){
                    _this.setData({
                        'userInfo_flag': true
                    })
                    wx.hideLoading({
                        title: '登录中...'
                    })
                }
            );
        } else {
            //用户按了拒绝按钮
        }
    },
    jumpToFabuPage:function(){
        wx.navigateTo({ url: '../choujiang_fabu/choujiang_fabu' });
    },
    jumpToHuodongPepple:function(){
        wx.navigateTo({ url: '../huodong_people/huodong_people' });
    },
    changeNavbar:function(e){
        var flag = e.target.dataset.flag;
        this.setData({
            navbar_flag: flag
        })
    },
    tishi:function(e){
        var text = e.target.dataset.text;
        wx.showToast({
            title: text,
            icon: 'none',
            duration: 2000
        })
    }
})