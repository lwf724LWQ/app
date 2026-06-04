/**
 * 解析查询字符串为对象
 * @param {string} search 查询字符串，例如 "?a=1&a=2&b=hello%20world&c"
 * @returns {Object} 解析后的对象，重复键变为数组
 */
function parseQuery(search) {
  // 去除开头的 '?' 如果存在
  const raw = search.startsWith('?') ? search.slice(1) : search;
  if (!raw) return {};

  const result = {};
  const pairs = raw.split('&');

  for (let pair of pairs) {
    if (pair === '') continue;

    let [key, value] = pair.split('=');
    // 解码 key 和 value（将 '+' 转为空格再解码）
    key = decodeURIComponent(key.replace(/\+/g, ' '));
    value = value !== undefined
      ? decodeURIComponent(value.replace(/\+/g, ' '))
      : '';  // 没有 '=' 的情况，如 "a" 视为空字符串

    // 处理重复键：若已有该键，转为数组再追加；否则直接设置
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * 将对象序列化为查询字符串
 * @param {Object} obj 要序列化的对象（支持一级键值对，数组值会展开为同名多个参数）
 * @returns {string} 查询字符串（不含 '?'）
 */
function stringifyQuery(obj) {
  const parts = [];

  for (let key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const value = obj[key];
    const encodedKey = encodeURIComponent(key);

    if (Array.isArray(value)) {
      // 数组：每个元素生成一个同名参数
      for (let item of value) {
        const encodedVal = encodeURIComponent(item);
        parts.push(`${encodedKey}=${encodedVal}`);
      }
    } else {
      // 基本类型：null/undefined 转为空字符串
      const strValue = value == null ? '' : String(value);
      const encodedVal = encodeURIComponent(strValue);
      parts.push(`${encodedKey}=${encodedVal}`);
    }
  }

  return parts.join('&');
}

export default {
    parseQuery,
    stringifyQuery
}