import config from "./config"
// 生成随机字符串
function generateRandomString(length = 16) {
    const array = new Uint8Array(length);
    if (typeof crypto !== 'undefined') {
        crypto.getRandomValues(array);
    } else {
        // 降级处理
        for (let i = 0; i < length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
    }
    
    // 转换为十六进制字符串
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// 使用crypto 生成sha1加密
function sha1(str) {
    const buffer = new TextEncoder().encode(str);
    return crypto.subtle.digest('SHA-1', buffer).then(function(hash) {
        // 将hash值转换为十六进制字符串
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    });
}

// Base64编码函数
function base64Encode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

// 添加以下方法到 tool.js 文件中

/**
 * 使用 PEM 格式的私钥对数据进行 SHA256 with RSA 签名
 * @param {string} data - 需要签名的数据
 * @param {string} privateKeyPEM - PEM 格式的私钥
 * @returns {Promise<string>} - 返回签名结果的 base64 编码字符串
 */
async function signWithRSA(data, privateKeyPEM) {
    try {
        // 解析 PEM 格式的私钥，提取 DER 格式的数据
        const pemHeader = "-----BEGIN PRIVATE KEY-----";
        const pemFooter = "-----END PRIVATE KEY-----";
        const pemContents = privateKeyPEM.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');
        const binaryDerString = atob(pemContents);
        const binaryDer = new Uint8Array(binaryDerString.length);
        for (let i = 0; i < binaryDerString.length; i++) {
            binaryDer[i] = binaryDerString.charCodeAt(i);
        }

        // 导入私钥
        const privateKey = await crypto.subtle.importKey(
            "pkcs8",
            binaryDer.buffer,
            {
                name: "RSASSA-PKCS1-v1_5",
                hash: { name: "SHA-256" }
            },
            false,
            ["sign"]
        );

        // 将数据编码为 ArrayBuffer
        const encodedData = new TextEncoder().encode(data);

        // 执行签名操作
        const signature = await crypto.subtle.sign(
            "RSASSA-PKCS1-v1_5",
            privateKey,
            encodedData
        );

        // 将签名结果转换为 base64 字符串
        const signatureArray = new Uint8Array(signature);
        let signatureBase64 = '';
        for (let i = 0; i < signatureArray.length; i++) {
            signatureBase64 += String.fromCharCode(signatureArray[i]);
        }
        return btoa(signatureBase64);
    } catch (error) {
        console.error("签名过程中发生错误:", error);
        throw error;
    }
}

function log(...arg){
    if(config.isDebug){
        console.log(...arg)
    }
}

export default { generateRandomString, sha1, signWithRSA, base64Encode, log }