import "./chunk-TDUMLE5V.js";

// C:/Users/张心怡/Documents/xwechat_files/wxid_0dlokvifhy6222_a957/msg/file/2025-10/wodexmu/wodexmu/node_modules/nanoid/url-alphabet/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

// C:/Users/张心怡/Documents/xwechat_files/wxid_0dlokvifhy6222_a957/msg/file/2025-10/wodexmu/wodexmu/node_modules/nanoid/index.browser.js
var random = (bytes) => crypto.getRandomValues(new Uint8Array(bytes));
var customRandom = (alphabet, defaultSize, getRandom) => {
  let mask = (2 << Math.log2(alphabet.length - 1)) - 1;
  let step = -~(1.6 * mask * defaultSize / alphabet.length);
  return (size = defaultSize) => {
    let id = "";
    while (true) {
      let bytes = getRandom(step);
      let j = step | 0;
      while (j--) {
        id += alphabet[bytes[j] & mask] || "";
        if (id.length >= size)
          return id;
      }
    }
  };
};
var customAlphabet = (alphabet, size = 21) => customRandom(alphabet, size | 0, random);
var nanoid = (size = 21) => {
  let id = "";
  let bytes = crypto.getRandomValues(new Uint8Array(size |= 0));
  while (size--) {
    id += urlAlphabet[bytes[size] & 63];
  }
  return id;
};
export {
  customAlphabet,
  customRandom,
  nanoid,
  random,
  urlAlphabet
};
//# sourceMappingURL=nanoid.js.map
