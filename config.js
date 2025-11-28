// 微信二维码生成器配置文件
const config = {
    // AppID配置列表，格式：{name: '显示名称', value: '实际AppID'}
    appidList: [
        { name: '御风点餐-测试', value: 'wxd26f69dc103769e5' },
        { name: '吾享智能', value: 'wx713931c9accc58f1' },
        { name: '吾享体验前线', value: 'wxce26fe91efc05d02' },
        { name: '吾享聚合', value: 'wx0658f169cc4d4e6c' },
        { name: '吾享聚合服务+', value: 'wx5189653e14282f9b' },
        { name: '吾享点+', value: 'wxf5a38c4b5409d9bf' },
        { name: '吾享通聚合', value: 'wxafb4fcc54c70a08a' },
        { name: '平台生产', value: 'wx8022fc66b8ba2821' },
        { name: '御风收银点餐', value: 'wx8c4ff9c3bace8038' }
    ],
    
    // Business Type配置列表，格式：{name: '显示名称', value: '实际值', pathTemplate: '路径模板'}
    bustypeList: [
        { name: '外卖', value: 'WM', pathTemplate: 'pages/index/index.html?context=WM&mcid={{mcid}}&iswxtpa=1#wechat-redirect' },
        { name: '自提', value: 'ZT', pathTemplate: 'pages/index/index.html?context=ZT&mcid={{mcid}}&iswxtpa=1#wechat-redirect' },
        { name: '点餐', value: 'DC', pathTemplate: 'pages/index/index.html?context=DC&mcid={{mcid}}&iswxtpa=1#wechat-redirect' },
        { name: '我的订单', value: 'OD', pathTemplate: 'pages/index/index.html?context=OD&page=myOrder&mcid={{mcid}}&tableno={{tableno}}&iswxtpa=1#wechat-redirect' },
        { name: '首页', value: 'HOME', pathTemplate: 'pages/index/index.html?context=HOME&page=home&mcid={{mcid}}&tableno={{tableno}}&iswxtpa=1#wechat-redirect' },
        { name: '卡主页', value: 'CD', pathTemplate: 'pages/index/index.html?context=CD&page=cardHome&mcid={{mcid}}&tableno={{tableno}}&iswxtpa=1#wechat-redirect' }
    ],
    
    // 默认参数
    defaultParams: {
        mcid: '41941',
        bustype: 'WM',
        path: 'pages/index/index.html'
    }
};