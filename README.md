# wechat-cash

Beta release, please do not use in production. For more details, please contact the author.

```js
'use strict';
var fs = require('fs');
var Cash = require('wechat-cash');

var config = {
  partnerKey: '888f8e88888b88a8ebafc8e88e88e88f',
  appId: 'wxc88a88d88d8b8c88',
  mchId: '8888888888',
  pfx: fs.readFileSync(__dirname + '/apiclient_cert.p12')
};

var cash = new Cash(config);
cash.sendRedpack({
  'mch_billno': config.mchId + '201509220123456789',
  'wxappid': config.appId,
  'send_name': 'lodejs.org',
  're_openid': 'o-hVKuNknQQBZFDlbE8eibQzIX8o',
  'total_amount': 10000, //RMB100
  'total_num': 1,
  'wishing': '恭喜发财',
  'client_ip': '127.0.0.1',
  'act_name': '奖金发放',
  'remark': '打赏QQ:5794560'
}, function(err, result) {
  console.log(err, result);
});

cash.sendGroupRedpack({
  'mch_billno': config.mchId + '201509230123456789',
  'wxappid': config.appId,
  'send_name': 'lodejs.org',
  're_openid': 'o-hVKuNknQQBZFDlbE8eibQzIX8o',
  'total_amount': 10000, //RMB100
  'total_num': 3,
  'wishing': '恭喜发财',
  'act_name': '裂变红包',
  'remark': '打赏QQ:5794560'
}, function(err, result) {
  console.log(err, result);
});
```