// pages/huodong_people/huodong_people.js
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        page:1,
        page_num:50,
        users:[],
        hasNext:false,
        total:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getOneHuodongPeoples();
    },
    onPullDownRefresh: function () {
        this.onLoad();
    },
    getOneHuodongPeoples:function(){
        var _this = this;
        wx.request({
            url: app.globalData.server_url + 'xcx/index/api_get_one_huodong_peoples',
            method: 'POST',
            data: {
                'huodong_id': app.globalData.huodong_id,
                'page':_this.data.page,
                'page_num': _this.data.page_num
            },
            success(data) {
                if (data.data.error_code == 0) {
                    _this.setData({
                        page:_this.data.page+1
                    })
                    var arry = _this.data.users;
                    if (data.data.data.users.total <= data.data.data.users.current_page * _this.data.page_num) {
                        _this.setData({
                            hasNext: false
                        })
                    }
                    else{
                        _this.setData({
                            hasNext: true
                        })
                    }
                    for (var i = 0; i < data.data.data.users.data.length;i++){
                        if (!data.data.data.users.data[i].avatarurl){
                            data.data.data.users.data[i].avatarurl = '../../images/my/default-headimg.png'
                        }
                    }
                    arry = arry.concat(data.data.data.users.data);
                    _this.setData({
                        total: data.data.data.users.total,
                        users: arry
                    })
                }
            },
            complete(){
                wx.stopPullDownRefresh();
            }
        })
    }
})