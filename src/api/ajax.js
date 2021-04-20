import axios from 'axios'
import qs from 'qs'
import Auth from '@/assets/utils/Auth.js'
import ModalWarn from '@/components/ModalWarn.js'
import JSONBig from "json-bigint";
var CancelToken = axios.CancelToken
//POST传参序列化
axios.interceptors.request.use(
  config => {
    if (config.method === 'post') {
      if(config.headers["Content-Type"] !== 'application/json'){
        config.data = qs.stringify(config.data)
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

//返回状态判断
axios.interceptors.response.use(
  res => {
    res.data.isError && (res.data.success = false);
    res.data.message = (res.data.msg || res.data.message) ? (res.data.msg || res.data.message) : '';
    if(!res.data.success && !res.data.message){
      res.data.message = '数据异常';
    }
    if (res.data.NO_LOGIN && res.data.NO_LOGIN === 'NO_LOGIN') {
      window.location.href = window.location.origin
      return
    }

    return res;
  },
  error => {
    if (error.response.status === 555) {
      return Promise.resolve({
        data: {
          success: false,
          message: error.message
            ? error.message
            : '没有权限' + error.response.status
        }
      })
    } else if (error.response.status === 404) {
      return Promise.resolve({
        data: {
          success: false,
          message: error.message
            ? error.message
            : '网络异常,status ' + error.response.status
        }
      })
    }
  }
)

axios.defaults.method = 'post'
axios.defaults.baseURL = window.location.origin

export default function(...rest) {
  let config;
  if(rest && rest[0]){
    if (typeof rest[0] === 'object') {
      config = {
        ...{
          url: '',
          data: {},
          method: 'post',
          prov: '',
          type: 'application/x-www-form-urlencoded',
          trans: false
        },
        ...(rest[0] || {})
      };
    } else {
     let [url, data, method, prov, type, trans, cancelObj] = rest;
      config = {
        url, data, method, prov, type, trans, cancelObj
      }
    }
  }
  if (prov && !Auth(prov)) {
    return Promise.resolve({
      success: false,
      message: url + 'NO_RIGHT'
    })
  }
  return new Promise((resolve, reject) => {
    config.url = config.url + '?t=' + new Date().getTime();
    config.headers = {
      ...{
        'Content-Type': config.type || 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
      },
      ...(config.headers || {})
    }
    config.method = config.method || 'post';
    if (config.trans) {
      config.transformResponse = config.trans === true ? [function (data) {
        return JSONBig.parse(data);
      }] : config.trans;
    }
    config.CancelToken = new CancelToken(function (f) {
      if (config.cancelObj) {
        if (!config.cancelObj.hasOwnProperty(config.url)) {
          config.cancelObj[config.url] = f
        }
      }
    });

    if (config.method && config.method === 'post') {
      config.data = config.data || {}
    } else {
      config.params = config.data
    }

    axios(config)
      .then(
        response => {
          if (!response.data.success) {
            ModalWarn({
              content: response.data.message
            })
          }
          resolve(response.data);
        },
        err => {
          ModalWarn({
            content: err.message
              ? err.message
              : '网络异常,status ' + err.response.status
          })
          resolve({
            data: {
              success: false,
              message: err.message
                ? err.message
                : '网络异常,status ' + err.response.status
            }
          })
        }
      )
      .catch(err => {
        ModalWarn({
          content: err.message
            ? err.message
            : '网络异常,status ' + err.response.status
        })
        resolve({
          data: {
            success: false,
            message: err.message
              ? err.message
              : '网络异常,status ' + err.response.status
          }
        })
      })
  })
}
