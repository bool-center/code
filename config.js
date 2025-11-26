// 微信二维码生成器配置文件
const config = {
  // AppID配置列表，格式：{name: '显示名称', value: '实际AppID'}
  appidList: [
    { name: '御风点餐-青橙测试', value: 'wxd26f69dc103769e5' },
    { name: '吾享智能', value: 'wx713931c9accc58f1' },
    { name: '吾享体验前线', value: 'wxce26fe91efc05d02' },
    { name: '吾享聚合-生产', value: 'wx0658f169cc4d4e6c' }
  ],
  
  // Business Type配置列表，格式：{name: '显示名称', value: '实际值', pathTemplate: '路径模板'}
  bustypeList: [
    { name: '外卖', value: 'WM', pathTemplate: 'pages/index/index.html?context=WM&mcid={{mcid}}&iswxtpa=1#wechat-redirect' },
    { name: '公众号', value: 'MP', pathTemplate: 'pages/index/index.html?context=MP&mcid={{mcid}}&iswxtpa=1#wechat-redirect' },
    { name: '企业微信', value: 'WXWORK', pathTemplate: 'pages/index/index.html?context=WXWORK&mcid={{mcid}}&iswxtpa=1#wechat-redirect' },
    { name: 'H5页面', value: 'H5', pathTemplate: 'pages/index/index.html?context=H5&mcid={{mcid}}&iswxtpa=1#wechat-redirect' },
    { name: '其他类型', value: 'OTHER', pathTemplate: 'pages/index/index.html?context=OTHER&mcid={{mcid}}&iswxtpa=1#wechat-redirect' }
  ],
  
  // 默认参数
  defaultParams: {
    mcid: '41941',
    bustype: 'WM',
    path: 'pages/index/index.html',
    qrsize: 250
  }
};
