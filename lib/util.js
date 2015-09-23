'use strict';
var crypto = require('crypto');
var xml2js = require('xml2js');
var _ = require('lodash');

function sortedQuery(params) {
  return Object.keys(params).filter(function(key) {
    return !!params[key];
  }).sort().map(function(key) {
    return key + '=' + params[key];
  }).join('&');
}

exports.sortedQuery = sortedQuery;

exports.sign = function(params, key) {
  var query = sortedQuery(params) + '&key=' + key;
  return crypto.createHash('md5').update(new Buffer(query, 'utf8')).digest('hex').toUpperCase();
};

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
        error = new Error(data.err_code);
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
