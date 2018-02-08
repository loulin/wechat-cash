'use strict';
var xml2js = require('xml2js');
var _ = require('lodash');

exports.wrapper = function(callback) {
  callback = callback || function() {};

  // res is kept for future
  return function(err, xml, res) {
    if (err) {
      return callback(err, xml, res);
    }

    xml2js.parseString(xml, {
      trim: true,
      explicitArray: false
    }, function(err, json) {
      if (err) {
        err.name = 'XMLParseError';
        return callback(err, xml, res);
      }

      var error = null;
      var data = json ? json.xml : {};

      if (data.return_code === 'FAIL') {
        error = new Error(data.return_msg);
        error.name = 'ProtocolError';
      } else if (data.result_code === 'FAIL') {
        error = new Error(JSON.stringify({
          err_code: data.err_code,
          err_code_des: data.err_code_des,
        }));
        error.name = 'BusinessError';
      }

      callback(error, data, res);
    });
  };
};

exports.checkParams = function(params, expected, common) {
  expected = _.extend(expected, common || {
    mch_id: true,
    nonce_str: true,
    mch_billno: true,
    wxappid: true,
    send_name: true,
    total_amount: true,
    total_num: true,
    wishing: true,
    act_name: true,
    remark: true,
    sign: true
  });

  var useless = [];
  Object.keys(params).forEach(function(key) {
    if (expected[key] === undefined) {
      useless.push(key);
    }
  });

  if (useless.length) {
    return 'useless params ' + useless.join(',');
  }

  var missing = [];
  Object.keys(expected).forEach(function(key) {
    if ((expected[key] === true) && !params[key]) {
      missing.push(key);
    }
  });

  if (missing.length) {
    return 'missing params ' + missing.join(',');
  }

  return null;
};
