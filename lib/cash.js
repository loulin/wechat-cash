'use strict';

var xml2js = require('xml2js');
var _ = require('lodash');
var Payment = require('wechat-pay').Payment;

Payment.prototype._signedQuery = function(url, params, options, callback) {
  var self = this;
  var required = options.required || [];
  params = this._extendWithDefault(params, (params.wxappid ? [] : ['appid']).concat([
    'mch_id',
    'sub_mch_id',
    'nonce_str'
  ]));

  params = _.extend({
    'sign': this._getSign(params)
  }, params);

  if (params.long_url) {
    params.long_url = encodeURIComponent(params.long_url);
  }

  for (var key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      params[key] = params[key].toString();
    }
  }

  var missing = [];
  required.forEach(function(key) {
    if (!params[key]) {
      missing.push(key);
    }
  });

  if (missing.length) {
    return callback('missing params ' + missing.join(','));
  }

  var request = (options.https ? this._httpsRequest : this._httpRequest).bind(this);
  request(url, this.buildXml(params), function(err, body) {

    if (err) {
      return callback(err);
    }
    self.validate(body, callback);
  });

};

Payment.prototype.sendRedpack = function(params, callback) {
  this._signedQuery('https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack', params, {
    https: true,
    required: ['mch_billno', 'wxappid', 'send_name', 're_openid', 'total_amount', 'total_num', 'wishing', 'client_ip', 'act_name', 'remark'],
  }, callback);
};


Payment.prototype.validate = function(xml, callback) {
  xml2js.parseString(xml, {
    trim: true,
    explicitArray: false
  }, function(err, json) {
    var error = null,
      data;
    if (err) {
      error = new Error();
      err.name = 'XMLParseError';
      return callback(err, xml);
    }

    data = json ? json.xml : {};

    if (data.return_code === 'FAIL') {
      error = new Error(data.return_msg);
      error.name = 'ProtocolError';
    } else if (data.result_code === 'FAIL') {
      error = new Error(data.err_code);
      error.name = 'BusinessError';
    }

    callback(error, data);
  });
};

module.exports = Payment;
