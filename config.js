// 微信二维码生成器配置文件
const config = {
    // AppID配置列表，格式：{name: '显示名称', value: '实际AppID'}
    appidList: [
        { name: '吾享体验前线', value: 'wxce26fe91efc05d02' },
        { name: '体验聚合(测试平台小程序)', value: 'wx0aef6e2c0955e99f' },
        { name: '御风点餐-测试', value: 'wxd26f69dc103769e5' },
        { name: '御风点餐palt-测试聚合', value: 'wx1bf8365f76b1c06a' },
        { name: '吾享聚合', value: 'wx0658f169cc4d4e6c' },
        { name: '吾享聚合服务+', value: 'wx5189653e14282f9b' },
        { name: '吾享点+', value: 'wxf5a38c4b5409d9bf' },
        { name: '吾享通聚合', value: 'wxafb4fcc54c70a08a' },
        { name: '平台生产', value: 'wx8022fc66b8ba2821' },
        { name: '御风科技收银(青橙生产聚合)', value: 'wx99fca1ce07a8274b' },
        { name: '客享来体验', value: 'wx118a2087c4781fc5' },
        { name: '吾享通', value: 'wx93c15f7a80819b6d' },
        { name: '御风收银管家(青橙生产平台)', value: 'wx8c4ff9c3bace8038' }
    ],
    
    // Business Type配置列表，格式：{name: '显示名称', value: '实际值', pathTemplate: '路径模板'}
    bustypeList: [
        { name: '外卖', value: 'WM', pathTemplate: 'pages/index/index.html?context=WM&mcid={{mcid}}&tableno={{tableno}}' },
        { name: '自提', value: 'ZT', pathTemplate: 'pages/index/index.html?context=ZT&mcid={{mcid}}&tableno={{tableno}}' },
        { name: '团餐外卖', value: 'TCWM', pathTemplate: 'pages/index/index.html?context=WM&cusbusiness=TC&mcid={{mcid}}&tableno={{tableno}}' },
        { name: '团餐自提', value: 'TCZT', pathTemplate: 'pages/index/index.html?context=ZT&cusbusiness=TC&mcid={{mcid}}&tableno={{tableno}}' },
        { name: '点餐', value: 'DC', pathTemplate: 'pages/index/index.html?context=DC&mcid={{mcid}}&tableno={{tableno}}' },
        { name: '我的订单', value: 'OD', pathTemplate: 'pages/index/index.html?context=OD&page=myOrder&mcid={{mcid}}&tableno={{tableno}}' },
        { name: '首页', value: 'HOME', pathTemplate: 'pages/index/index.html?context=HOME&page=home&mcid={{mcid}}&tableno={{tableno}}' },
        { name: '卡主页', value: 'CD', pathTemplate: 'pages/index/index.html?context=CD&page=cardHome&mcid={{mcid}}&tableno={{tableno}}' }
    ],
    
    // 默认参数
    defaultParams: {
        mcid: '41941',
        bustype: 'WM',
        path: 'pages/index/index.html'
    }
};