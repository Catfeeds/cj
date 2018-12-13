// pages/choujiang_fabu/choujiang_fabu.js
var md5 = require('../../utils/md5.js');
var app = getApp();
var ctx = wx.createCanvasContext('firstCanvas')
var sys_info;
var r,r2;
wx.getSystemInfo({
    success(res) {
        sys_info = res;
        r2 = 750 / sys_info.screenWidth;
    }
})
var now_date = new Date();

var days = [], days_show = [], hours = [], minutes = [];
var weekday = new Array(7)
weekday[0] = "周日"
weekday[1] = "周一"
weekday[2] = "周二"
weekday[3] = "周三"
weekday[4] = "周四"
weekday[5] = "周五"
weekday[6] = "周六"
function fun_date(aa) {
    var date1 = new Date();
    var date2 = new Date(date1);
    date2.setDate(date1.getDate() + aa);
    return date2;
}
for(var i=0;i<=7;i++){
    var date = fun_date(i);
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    days.push(date);
    days_show.push(M + '月' + D + '日 ' + weekday[date.getDay()]);
}
for (var i = 0; i <= 23; i++){
    hours.push(i)
}
for(var i=0;i<=59;i++){
    var min;
    if(i<10){
        min = '0'+i;
    }
    else{
        min = i;
    }
    minutes.push(min);
}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        img_domain: app.globalData.img_domain,
        bg_flag:true,
        crop_flag:true,
        crop_img:'',
        crop_img_height:0,
        crop_img_width:0,
        crop_status:'',
        lastY:'',
        lastX:'',
        change_y:0,
        change_x:0,
        prices_index:0,
        prices:[
            {
                img:'',
                img_local:'',
                jiangpin_text:'',
                jiangpin_num:'',
                jiangpin_type:"1",
                jiangpin_money:''
            }
        ],
        jiangpin_type_arry: ['实物', '虚拟','到店奖品'],
        content:'',
        content_imgs:[],
        choujiang_shuoming:'',
        kouling_state:0,
        kouling:'',
        kouling_tip:'',
        qr_type:'1',
        qr_type_arry: ['个人微信号', '公众号', '小程序','其他'],
        qr_text:'',
        qr_img:'',
        danbao_problem:true,
        is_danbao:'0',
        danbao_money:'',
        to_index_state:'0',
        kaijiang_type_arry: ['指定时间开奖','指定人数开奖'],
        kaijiang_type:'1',
        kaijiang_num:'',
        days:days,
        days_show: days_show,
        hours:hours,
        minutes: minutes,
        time_value: [0,now_date.getHours(),now_date.getMinutes()]
    },
    onLoad:function(){
        ctx.clearRect(0, 0, 750 / r2, 350 / r2);
        ctx.draw();
    },
    chooseImg:function(e){
        var index = e.target.dataset.index;
        this.data.prices_index = index;
        var _this = this;
        wx.chooseImage({
            count: 1,
            // sizeType: ['original'],
            sourceType: ['album', 'camera'],
            success(res) {
                _this.setData({ 
                    crop_flag: false,
                    crop_img: res.tempFilePaths[0],
                    change_y: 0,
                    change_x: 0
                });
            }
        })
    },
    getImage:function(e){
        r = sys_info.screenWidth / e.detail.width;
        this.setData({
            crop_img_width: sys_info.screenWidth,
            crop_img_height: e.detail.height*r
        });
    },
    moveImage:function(e){
        if (this.data.lastY == '' && this.data.lastX == ''){
            this.data.lastY = e.changedTouches[0].pageY;
            // this.data.lastX = e.changedTouches[0].pageX;
        }
        if (e.changedTouches.length == 1) {
            var y = e.changedTouches[0].pageY - this.data.lastY + this.data.change_y;
            // var x = e.changedTouches[0].pageX - this.data.lastX + this.data.change_x;
            if (y<3 && this.data.crop_img_height - 350/r2 > Math.abs(y)){
                this.setData({ change_y: y });
                this.data.lastY = e.changedTouches[0].pageY;
            }
            // if (x<0 && this.data.crop_img_width - 750/r > Math.abs(x)) {
            //     this.setData({ change_x: x });
            //     this.data.lastX = e.changedTouches[0].pageX;
            // }
        }
    },
    getFirstPoint:function(e){
        this.data.lastY = '';
        // this.data.lastX = '';

        if (e.changedTouches.length == 1){
            this.data.crop_status = 'move';
        }
        else if (e.changedTouches.length > 1){
            this.data.crop_status = 'zoom';
        }
    },
    cropImage:function(){
        var _this = this;
        console.log(r,r2)
        ctx.drawImage(this.data.crop_img, Math.abs(this.data.change_x)/r, Math.abs(this.data.change_y)/r, 750/r2/r , 350/r2/r , 0,0, 750/r2, 350/r2);
        ctx.draw(false,function(){
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: 750 / r2,
                height: 350 / r2,
                canvasId: 'firstCanvas',
                success(res) {
                    var s = 'prices['+_this.data.prices_index+'].img';
                    var s1 = 'prices[' + _this.data.prices_index + '].img_local';
                    _this.setData({
                        [s1]: res.tempFilePath,
                        crop_flag:true
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
                                [s]: obj.key
                            })
                        }
                    })
                }
            })
        });
    },
    jiangpinTextInput: function (e) {
        var index = e.target.dataset.index;
        var s1 = 'prices[' + index + '].jiangpin_text';
        this.setData({
            [s1]: e.detail.value
        })
    },
    jiangpinNumInput:function(e){
        var index = e.target.dataset.index;
        var num = e.detail.value;
        if (parseInt(num) > 200){
            num = 200;
        }
        else if (parseInt(num)<1){
            num = 1;
        }
        var key = 'prices[' + index + '].jiangpin_num';
        this.setData({
            [key]: num
        })
    },
    priceTypeChange:function(e){
        console.log(e)
        var index = e.target.dataset.index;
        var jiangpin_type = e.detail.value;
        var key = 'prices[' + index + '].jiangpin_type';
        this.setData({
            [key]: parseInt(jiangpin_type)+1
        })
    },
    jiangpinMoneyInput: function (e) {
        var index = e.target.dataset.index;
        var s1 = 'prices[' + index + '].jiangpin_money';
        var money = e.detail.value;
        if (parseInt(money) > 20000){
            money = 20000;
        }
        this.setData({
            [s1]: money
        })
    },
    addPrice:function(){
        var that = this;
        that.data.prices.push({
            img: '',
            img_local: '',
            jiangpin_text: '',
            jiangpin_num: '',
            jiangpin_type: "1",
            jiangpin_money: ''
        })
        that.setData({
            prices: that.data.prices
        })
    },
    contentInput:function(e){
        this.setData({
            content: e.detail.value
        })
    },
    addContentImg: function (e) {
        var that = this;
        var content_imgs = that.data.content_imgs;
        wx.chooseImage({
            count: 5 - content_imgs.length,
            // sizeType: ['original'],
            sourceType: ['album', 'camera'],
            success(res) {
                var i=0;
                var tempFilePaths = res.tempFilePaths;
                uploadFile();
                function uploadFile(){
                    wx.uploadFile({
                        url: 'https://up.qbox.me',
                        filePath: tempFilePaths[i],
                        name: 'file',
                        formData: {
                            'token': app.globalData.qiniu.token
                        },
                        success(res) {
                            var obj = JSON.parse(res.data);
                            content_imgs.push(obj.key);
            
                            i++;
                            if (i < tempFilePaths.length){
                                uploadFile();
                            }
                            else if (i == tempFilePaths.length){
                                that.setData({
                                    content_imgs: content_imgs
                                })
                            }
                        }
                    })
                }
            }
        })
    },
    choujiangShuomingInput:function(e){
        this.setData({
            choujiang_shuoming: e.detail.value
        })
    },
    koulingChange:function(e){
        if(e.detail.value){
            this.setData({
                kouling_state:1
            })
        }
        else{
            this.setData({
                kouling_state: 0
            })
        }
    },
    koulingInput:function(e){
        this.setData({
            kouling: e.detail.value
        })
    },
    koulingTipInput:function(e){
        this.setData({
            kouling_tip: e.detail.value
        })
    },
    qrTextInput:function(e){
        this.setData({
            qr_text: e.detail.value
        })
    },
    qrTypeChange:function(e){
        this.setData({
            qr_type:parseInt(e.detail.value)+1
        })
    },
    addQrImg:function(e){
        var that = this;
        wx.chooseImage({
            count: 1,
            // sizeType: ['original'],
            sourceType: ['album', 'camera'],
            success(res) {
                wx.uploadFile({
                    url: 'https://up.qbox.me',
                    filePath: res.tempFilePaths[0],
                    name: 'file',
                    formData: {
                        'token': app.globalData.qiniu.token
                    },
                    success(res) {
                        var obj = JSON.parse(res.data);
                        that.setData({
                            qr_img: obj.key
                        })
                    }
                })
            }
        })
    },
    danbaoProblemShow:function(e){
        this.setData({
            bg_flag:false,
            danbao_problem:false
        })
    },
    hiddenBg:function(){
        this.setData({
            bg_flag: true,
            danbao_problem: true
        })
    },
    danbaoChange:function(e){
        var _this = this;
        if(e.detail.value){
            _this.setData({
                is_danbao: '2'
            })
        }
        else{
            _this.setData({
                is_danbao: '0',
                to_index_state:'0'
            })
        }
    },
    xianshiChange:function(e){
        if (e.detail.value){
            this.setData({
                to_index_state: '3'
            })
        }
        else{
            this.setData({
                to_index_state: '0'
            })
        }
    },
    tiaojianChange:function(e){
        this.setData({
            kaijiang_type: parseInt(e.detail.value)+1
        })
    },
    timeChange:function(e){
        this.setData({
            time_value: e.detail.value
        })
    },
    kaijiangNumInput:function(e){
        var num = e.detail.value;
        if(parseInt(num)<1){
            num = 1;
        }
        else if (parseInt(num) > 100000){
            num = 100000;
        }
        this.setData({
            kaijiang_num: num
        })
    },
    faqiChoujiang:function(e){
        wx.showLoading({
            title: ''
        })
        var form_id = e.detail.formId;
        var _this = this;
        var sendtime = Date.parse(new Date());
        var pwrand = parseInt(Math.random() * (99999 - 10000 + 1) + 10000);
        var pwstr = md5.hex_md5(wx.getStorageSync('openid') + sendtime + 'ebuNOvBiakyTgLaAjsGeAmVwYLNaKSUB' + pwrand);
        var kaijiang_type = _this.data.kaijiang_type;
        var kaijiang_num = _this.data.kaijiang_num;
        var date = new Date(this.data.days[this.data.time_value[0]]);
        var year = date.getFullYear();
        var month = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        date = new Date(year + '/' + month + '/' + day + ' ' + this.data.time_value[1] + ':' + this.data.time_value[2]+':00');
        var kaijiang_time = Date.parse(date)/1000;
        console.log(kaijiang_time)
        var to_index_state = this.data.to_index_state;
        var is_danbao = this.data.is_danbao;
        var jiangpins = JSON.stringify(this.data.prices);
        console.log(jiangpins)
        var content = this.data.content;
        var content_imgs = '';
        for (var i = 0; i < this.data.content_imgs.length;i++){
            if(i == 0){
                content_imgs += this.data.content_imgs[i];
            }
            else{
                content_imgs += ';'+this.data.content_imgs[i];
            }
        }
        var choujiang_shuoming = this.data.choujiang_shuoming;
        var kouling_state = this.data.kouling_state;
        var kouling = this.data.kouling;
        var kouling_tip = this.data.kouling_tip;
        var qr_type = this.data.qr_type;
        var qr_text = this.data.qr_text;
        var qr_img = this.data.qr_img;
        app.updateUnionid().then(
            function(){
                wx.request({
                    url: app.globalData.server_url + 'xcx/user/api_send_choujiang',
                    data: {
                        'form_id': form_id,
                        'openid': wx.getStorageSync('openid'),
                        'sendtime': sendtime,
                        'pwrand': pwrand,
                        'pwstr': pwstr,
                        'kaijiang_type': kaijiang_type,
                        'kaijiang_num': kaijiang_num,
                        'kaijiang_time': kaijiang_time,
                        'to_index_state': to_index_state,
                        'is_danbao': is_danbao,
                        'jiangpins': jiangpins,
                        'content': content,
                        'content_imgs': content_imgs,
                        'choujiang_shuoming': choujiang_shuoming,
                        'kouling_state': kouling_state,
                        'kouling': kouling,
                        'kouling_tip': kouling_tip,
                        'qr_type': qr_type,
                        'qr_text': qr_text,
                        'qr_img': qr_img
                    },
                    method: 'POST',
                    success(data) {
                        wx.hideLoading({
                            title: ''
                        })
                        console.log(data)
                        if (data.data.error_code == 0) {
                            
                        }
                        else {
                            wx.showToast({
                                title: data.data.error_message,
                                icon: 'none',
                                duration: 2000
                            })
                        }
                    }
                })
            }
        )
        
    }
})