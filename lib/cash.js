'use strict';

var sign = require('wechat-signature');
var Payment = require('wechat-pay').Payment;
var util = require('./util');

Payment.prototype._sendCashRequest = function(url, params, options, callback) {
  params = this._extendWithDefault(params, ['mch_id', 'nonce_str']);

  params.sign = sign(params, {
    key: this.partnerKey,
    upperCase: true
  });

  var error = util.checkParams(params, options.expected || {});

  if (error) {
    throw new Error(error);
  }

  this._httpsRequest(url, this.buildXml(params), util.wrapper(callback));
};

Payment.prototype.sendRedpack = function(params, callback) {
  this._sendCashRequest('https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack', params, {
    expected: {
      re_openid: true,
      client_ip: true,
      scene_id: false,
      risk_info: false,
      consume_mch_id: false
    },
  }, callback);
};

Payment.prototype.sendGroupRedpack = function(params, callback) {
  params.amt_type = params.amt_type || 'ALL_RAND';
  this._sendCashRequest('https://api.mch.weixin.qq.com/mmpaymkttransfers/sendgroupredpack', params, {
    expected: {
      re_openid: true,
      amt_type: true,
      scene_id: false,
      risk_info: false,
      consume_mch_id: false
    },
  }, callback);
};

Payment.prototype.getHbInfo = function(params, callback) {
  params.bill_type = params.bill_type || 'MCHT';
  params = this._extendWithDefault(params, ['appid', 'mch_id', 'nonce_str']);
  params.sign = sign(params, {
    key: this.partnerKey,
    upperCase: true
  });

  var error = util.checkParams(params, {
    bill_type: true
  }, {
    appid: true,
    mch_id: true,
    nonce_str: true,
    mch_billno: true,
    sign: true
  });

  if (error) {
    throw new Error(error);
  }

  this._httpsRequest('https://api.mch.weixin.qq.com/mmpaymkttransfers/gethbinfo', this.buildXml(params), util.wrapper(callback));
};

Payment.prototype.hbPreOrder = function(params, callback) {
  params.amt_type = params.amt_type || 'ALL_RAND';
  params.auth_mchid = params.auth_mchid || '1000052601';
  params.auth_appid = params.auth_appid || 'wxbf42bd79c4391863';
  params.risk_cntl = params.risk_cntl || 'NORMAL';
  this._sendCashRequest('https://api.mch.weixin.qq.com/mmpaymkttransfers/hbpreorder', params, {
    expected: {
      hb_type: true,
      amt_type: true,
      auth_mchid: true,
      auth_appid: true,
      risk_cntl: true,
    }
  }, callback);
};

module.exports = Payment;
