// Security hash helper.
// Pure-JS SHA-1 — window.crypto.subtle needs a secure context (HTTPS or
// localhost), so it's undefined when the app is served over plain HTTP
// (e.g. by bare IP without TLS), breaking every signed API call.
function rotl(n, s) { return ((n << s) | (n >>> (32 - s))) >>> 0; }

export async function calculateSHA1(text) {
  const utf8 = unescape(encodeURIComponent(text));
  const len = utf8.length;
  const wordCount = ((len + 8) >> 6) + 1;
  const words = new Array(wordCount * 16).fill(0);
  for (let i = 0; i < len; i++) {
    words[i >> 2] |= utf8.charCodeAt(i) << (24 - (i % 4) * 8);
  }
  words[len >> 2] |= 0x80 << (24 - (len % 4) * 8);
  words[wordCount * 16 - 1] = len * 8;

  let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;

  for (let blockStart = 0; blockStart < words.length; blockStart += 16) {
    const w = new Array(80);
    for (let t = 0; t < 16; t++) w[t] = words[blockStart + t];
    for (let t = 16; t < 80; t++) w[t] = rotl(w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16], 1);
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let t = 0; t < 80; t++) {
      let f, k;
      if (t < 20)      { f = (b & c) | (~b & d);        k = 0x5A827999; }
      else if (t < 40) { f = b ^ c ^ d;                 k = 0x6ED9EBA1; }
      else if (t < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC; }
      else             { f = b ^ c ^ d;                 k = 0xCA62C1D6; }
      const temp = (rotl(a, 5) + f + e + k + w[t]) >>> 0;
      e = d; d = c; c = rotl(b, 30); b = a; a = temp;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }

  return [h0, h1, h2, h3, h4].map(h => h.toString(16).padStart(8, '0')).join('').toUpperCase();
}

// Log helper to update ApiConsole
export function logApiCall(direction, url, method, requestBody, responseBody, status = 'success') {
  const event = new CustomEvent('api-log', {
    detail: {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      direction, // 'outgoing' (client to server) or 'incoming' (webhook callback to client)
      url,
      method,
      requestBody,
      responseBody,
      status
    }
  });
  window.dispatchEvent(event);
}

// Get configurations
// Environment presets
const ENV_PRESETS = {
  test: {
    // Use Vite proxy path to bypass CORS in dev
    baseUrl: '/api-test',
    realBaseUrl: 'https://tfmshippingsys.fastmove.com.tw',
    adminUrl: 'https://tfmshippingsys.fastmove.com.tw/fmshippingsysadmin',
    label: 'Test Environment (SDL)',
    merchantId: 'b0000a2',
    deptId: '0000b8',
    token: import.meta.env.VITE_TEST_TOKEN || ''
  },
  prod: {
    // Use Vite proxy path to bypass CORS in dev
    baseUrl: '/api-prod',
    realBaseUrl: 'https://fmshippingsys.fastmove.com.tw',
    adminUrl: 'https://fmshippingsys.fastmove.com.tw/fmshippingsysadmin',
    label: 'Production Environment (SimDuLich.VN)',
    merchantId: '0002',
    deptId: 'SimDuLich.VN (0002e7)',
    token: import.meta.env.VITE_PROD_TOKEN || ''
  }
};

export function getEnvPresets() { return ENV_PRESETS; }

export function getApiConfig() {
  const isSimulator = localStorage.getItem('api_simulator') === 'true'; // default false → real API
  const environment = localStorage.getItem('api_environment') || 'test';
  const preset = ENV_PRESETS[environment];

  const merchantId = localStorage.getItem('api_merchant_id') || preset.merchantId;
  const deptId     = localStorage.getItem('api_dept_id')     || preset.deptId;
  const token      = localStorage.getItem('api_token')       || preset.token;
  // Use proxy path (bypasses CORS), fallback to real URL if not in dev
  const baseUrl    = preset.baseUrl;
  const realBaseUrl = preset.realBaseUrl;

  return { isSimulator, environment, merchantId, deptId, token, baseUrl, realBaseUrl };
}


// Helper to make POST requests
async function postRequest(endpoint, payload) {
  const config = getApiConfig();
  const url = `${config.baseUrl}${endpoint}`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    logApiCall('outgoing', url, 'POST', payload, data, 'success');
    return data;
  } catch (error) {
    const errorResponse = { code: 999, msg: error.message || 'Network error' };
    logApiCall('outgoing', url, 'POST', payload, errorResponse, 'error');
    return errorResponse;
  }
}

// SIMULATOR MOCK DATA & RESPONSES
const MOCK_PRODUCTS = [
  { wmproductId: "WM_000001", productId: "eSIM-FS-JPtest-3_e", productName: "Japan (1GB per Day) - 03Day", productNamelang: "Nhật Bản 3 ngày 1GB/ngày", productRegion: "Japan", productType: 0, productPrice: 90, productcPrice: 150, csight: 1, leSIM: true },
  { wmproductId: "WM_000008", productId: "FS-JPtest-1_e", productName: "Japan, 1GB per day, 10 day", productNamelang: "Nhật Bản 10 ngày 1GB/ngày", productRegion: "Japan", productType: 1, productPrice: 85, productcPrice: 120, csight: 1, leSIM: false },
  { wmproductId: "WM_000005", productId: "FS-test_e", productName: "China, Hong Kong and Macau 1.5GB per day", productNamelang: "Trung Quốc, Hồng Kông, Macau 1.5GB/ngày", productRegion: "China, Hong Kong, Macau", productType: 2, productPrice: 25, productcPrice: 40, csight: 1, leSIM: false },
  { wmproductId: "WM_000003", productId: "eSIM-FS-Global-30_e", productName: "Global 30 Days Unlimited", productNamelang: "Toàn cầu 30 ngày không giới hạn", productRegion: "Global", productType: 0, productPrice: 450, productcPrice: 650, csight: 1, leSIM: true }
];

const mockStore = {
  orders: {},
  simCards: {
    "89851100002002001111": { status: 1, couponStatus: 2, firmName: "World Move", cid: "89851100002002001111", useSDate: "1715914638000", useEDate: "1717171199000", totalUsage: "1234567890", device: "iPhone 14 Pro", eid: "89049032007008882600140004945097" },
    "89859900700010810001": { status: 0, couponStatus: 1, firmName: "World Move", cid: "89859900700010810001", useSDate: null, useEDate: null, totalUsage: "0", device: null, eid: null }
  },
  progressEvents: {
    "89851100002002001111": [
      { cid: "89851100002002001111", eid: "89049032007008882600125701275506", progressDate: "2025-02-24 05:34:50", notificationPointid: 3, status: "Executed-Success" },
      { cid: "89851100002002001111", eid: "89049032007008882600125701275506", progressDate: "2025-02-24 05:35:07", notificationPointid: 4, status: "Executed-Success" },
      { cid: "89851100002002001111", eid: "89049032007008882600125701275506", progressDate: "2025-02-24 05:35:11", notificationPointid: 6, status: "Executed-Success" }
    ]
  }
};

// SIMULATED CALLBACK WEBHOOK SENDER
export async function simulateCallback(callbackType, payloadData) {
  const config = getApiConfig();
  const callbackUrlKey = `${callbackType}CallbackUrl`;
  const callbackUrl = localStorage.getItem(callbackUrlKey) || `http://localhost:5175/callback/${callbackType}`;
  
  // Calculate simulation response
  let callbackPayload = {};
  
  if (callbackType === 'order') {
    // 2.2 eSIM Order Callback
    const { orderId, email, prodList } = payloadData;
    const orderSN = "SN" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const itemList = prodList.map(item => ({
      iccid: "9900000" + Math.floor(Math.random() * 10000000000),
      productName: MOCK_PRODUCTS.find(p => p.wmproductId === item.wmproductId)?.productName || "eSIM Package",
      redemptionCode: "r" + Math.random().toString(36).substr(2, 9)
    }));
    
    const signatureBase = config.merchantId + orderId + orderSN + new Date().toISOString() + JSON.stringify(itemList) + config.token;
    const encStr = await calculateSHA1(signatureBase);
    
    callbackPayload = {
      orderId,
      orderSN,
      orderTime: new Date().toISOString().replace('T', ' ').substr(0, 19),
      code: 0,
      msg: "Mã kích hoạt đã tạo thành công",
      itemList,
      encStr
    };
    
    // Save to mock database for query
    mockStore.orders[orderId] = { ...callbackPayload, email };
  } 
  else if (callbackType === 'orderRedeem') {
    // 2.5 eSIM Order and Redeem Callback
    const { orderId, prodList, qrcodeType } = payloadData;
    const rcode = "rcode_" + Math.random().toString(36).substr(2, 9);
    const iccid = "898621" + Math.floor(10000000000000 + Math.random() * 90000000000000);
    const qrText = `LPA:1$rsp.worldmove.com$${Math.random().toString(36).substr(2, 20).toUpperCase()}`;
    
    const itemList = prodList.map(item => ({
      iccid,
      productName: MOCK_PRODUCTS.find(p => p.wmproductId === item.wmproductId)?.productName || "eSIM Package",
      qrcode: qrcodeType == 1 ? qrText : `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(qrText)}`,
      rcode,
      qrcodeType,
      resultcode: "000",
      resultmsg: "success",
      code: 0,
      msg: "成功",
      qrcodeContent: qrText,
      salePlanDays: 5,
      pin1: "1111",
      pin2: "2222",
      puk1: "33334444",
      puk2: "44445555",
      cfCode: "849372",
      apnExplain: "worldmove.com"
    }));
    
    const signatureBase = config.merchantId + orderId + JSON.stringify(itemList) + config.token;
    const encStr = await calculateSHA1(signatureBase);
    
    callbackPayload = {
      orderId,
      itemList,
      encStr
    };
    
    mockStore.orders[orderId] = callbackPayload;
    
    // Also save card to cards store
    mockStore.simCards[iccid] = {
      status: 1,
      couponStatus: 1,
      firmName: "World Move",
      cid: iccid,
      useSDate: null,
      useEDate: null,
      totalUsage: "0",
      device: null,
      eid: null
    };
  }
  else if (callbackType === 'deposit') {
    // 5.2 Top-up callback
    const { orderId, prodList } = payloadData;
    const itemList = prodList.map(item => ({
      wmproductId: item.wmproductId,
      day: item.day,
      simNum: item.simNum,
      code: 1, // 1: success
      msg: "Nạp tiền thành công"
    }));
    
    const signatureBase = config.merchantId + orderId + JSON.stringify(itemList) + config.token;
    const encStr = await calculateSHA1(signatureBase);
    
    callbackPayload = {
      orderId,
      itemList,
      encStr
    };
  }

  logApiCall('incoming', callbackUrl, 'POST', callbackPayload, "1", 'success');
  
  // Dispatch custom callback event for UI update
  const callbackEvent = new CustomEvent('api-callback-received', {
    detail: { callbackType, payload: callbackPayload }
  });
  window.dispatchEvent(callbackEvent);
  
  return "1";
}

// EXPORTED API CLIENT FUNCTIONS

// 1. Searching for My Quotations
export async function searchMyQuotations() {
  const config = getApiConfig();
  const signatureBase = config.merchantId + config.token;
  const encStr = await calculateSHA1(signatureBase);
  
  const payload = {
    merchantId: config.merchantId,
    encStr
  };
  
  if (config.isSimulator) {
    const response = {
      code: 0,
      msg: null,
      prodList: MOCK_PRODUCTS
    };
    logApiCall('outgoing', `${config.baseUrl}/Api/QuoteMg/myQueryAll`, 'POST', payload, response, 'success');
    return response;
  }
  
  return postRequest('/Api/QuoteMg/myQueryAll', payload);
}

// 2.1 eSIM Order
export async function createEsimOrder(email, prodList, systemMail = true) {
  const config = getApiConfig();
  
  // Calculate encStr: merchantId+deptId+email+prodListContents+token
  let prodListStr = "";
  prodList.forEach(item => {
    prodListStr += (item.wmproductId + item.qty);
  });
  
  const signatureBase = config.merchantId + config.deptId + email + prodListStr + config.token;
  const encStr = await calculateSHA1(signatureBase);
  
  const payload = {
    merchantId: config.merchantId,
    deptId: config.deptId,
    email,
    prodList,
    systemMail,
    encStr
  };
  
  if (config.isSimulator) {
    const orderId = "b" + config.merchantId + new Date().toISOString().replace(/[^0-9]/g, '').substr(2, 12);
    const response = {
      code: 0,
      msg: null,
      orderId
    };
    logApiCall('outgoing', `${config.baseUrl}/Api/SOrder/mybuyesim`, 'POST', payload, response, 'success');
    
    // If systemMail is false, we simulate receiving the callback after 2 seconds
    if (!systemMail) {
      setTimeout(() => {
        simulateCallback('order', { orderId, email, prodList });
      }, 2000);
    }
    
    return response;
  }
  
  return postRequest('/Api/SOrder/mybuyesim', payload);
}

// 2.3 Query eSIM Order
export async function queryEsimOrder(orderId) {
  const config = getApiConfig();
  const signatureBase = config.merchantId + orderId + config.token;
  const encStr = await calculateSHA1(signatureBase);
  
  const payload = {
    merchantId: config.merchantId,
    orderId,
    encStr
  };
  
  if (config.isSimulator) {
    // Check in simulation DB first
    const mockOrder = mockStore.orders[orderId];
    let response = {};
    
    if (mockOrder) {
      response = {
        code: 0,
        msg: null,
        orderId,
        orderSN: mockOrder.orderSN || "SN_QUERY_" + Math.random().toString(36).substr(2, 5).toUpperCase(),
        orderTime: mockOrder.orderTime || new Date().toISOString().replace('T', ' ').substr(0, 19),
        itemList: mockOrder.itemList
      };
    } else {
      // Return order not ready/failure code
      response = {
        code: 408,
        msg: "Esim data has not been generated yet.",
        orderId
      };
    }
    
    logApiCall('outgoing', `${config.baseUrl}/Api/SOrder/querybuyesim`, 'POST', payload, response, 'success');
    return response;
  }
  
  return postRequest('/Api/SOrder/querybuyesim', payload);
}

// 2.4 eSIM Order and Redeem
export async function createEsimOrderAndRedeem(qrcodeType, prodList) {
  const config = getApiConfig();
  
  let prodListStr = "";
  prodList.forEach(item => {
    prodListStr += (item.wmproductId + item.qty);
  });
  
  const signatureBase = config.merchantId + config.deptId + qrcodeType + prodListStr + config.token;
  const encStr = await calculateSHA1(signatureBase);
  
  const payload = {
    merchantId: config.merchantId,
    deptId: config.deptId,
    qrcodeType,
    prodList,
    encStr
  };
  
  if (config.isSimulator) {
    const orderId = "b" + config.merchantId + "red" + new Date().toISOString().replace(/[^0-9]/g, '').substr(2, 9);
    const response = {
      code: 0,
      msg: null,
      orderId
    };
    logApiCall('outgoing', `${config.baseUrl}/Api/SOrder/mybuyesimRedemption`, 'POST', payload, response, 'success');
    
    // Simulate webhook callback after 2 seconds
    setTimeout(() => {
      simulateCallback('orderRedeem', { orderId, prodList, qrcodeType });
    }, 2000);
    
    return response;
  }
  
  return postRequest('/Api/SOrder/mybuyesimRedemption', payload);
}

// 3.1 Redeem Redemption Code
export async function redeemRedemptionCode(rcode, qrcodeType = 2) {
  const config = getApiConfig();
  const signatureBase = config.merchantId + rcode + qrcodeType + config.token;
  const encStr = await calculateSHA1(signatureBase);
  
  const payload = {
    merchantId: config.merchantId,
    rcode,
    qrcodeType,
    encStr
  };
  
  if (config.isSimulator) {
    const response = {
      code: 0,
      msg: "成功"
    };
    logApiCall('outgoing', `${config.baseUrl}/Api/OrderRedemption/redemption`, 'POST', payload, response, 'success');
    
    // Simulate callback
    setTimeout(() => {
      const callbackUrl = localStorage.getItem('redeemCallbackUrl') || 'http://localhost:5175/callback/redeem';
      const qrText = `LPA:1$rsp.worldmove.com$REDEEM${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
      const iccid = "898621" + Math.floor(10000000000000 + Math.random() * 90000000000000);
      
      const callbackPayload = {
        qrcode: qrcodeType == 1 ? qrText : `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(qrText)}`,
        rcode,
        qrcodeType,
        resultcode: "000",
        resultmsg: "success",
        iccid,
        qrcodeContent: qrText,
        salePlanDays: 3,
        pin1: "1111",
        pin2: "2222",
        puk1: "33334444",
        puk2: "44445555",
        cfCode: "849372",
        apnExplain: "worldmove.com",
        encStr: "simulated_redeem_callback_signature"
      };
      
      logApiCall('incoming', callbackUrl, 'POST', callbackPayload, "1", 'success');
      
      // Dispatch callback event
      const callbackEvent = new CustomEvent('api-callback-received', {
        detail: { callbackType: 'redeem', payload: callbackPayload }
      });
      window.dispatchEvent(callbackEvent);
    }, 2000);
    
    return response;
  }
  
  return postRequest('/Api/OrderRedemption/redemption', payload);
}

// 4. Placing order for SIM card
export async function createSimOrder(invoiceType, taxId, receivingName, receivingTel, receivingAdd, note, prodList) {
  const config = getApiConfig();
  
  let prodListStr = "";
  prodList.forEach(item => {
    prodListStr += (item.productId + item.productName + item.qty);
  });
  
  const signatureBase = config.merchantId + config.deptId + invoiceType + taxId + receivingName + receivingTel + receivingAdd + note + prodListStr + config.token;
  const encStr = await calculateSHA1(signatureBase);
  
  const payload = {
    merchantId: config.merchantId,
    deptId: config.deptId,
    invoiceType,
    taxId,
    receivingName,
    receivingTel,
    receivingAdd,
    note,
    prodList,
    encStr
  };
  
  if (config.isSimulator) {
    const orderId = "b" + config.merchantId + "sim" + new Date().toISOString().replace(/[^0-9]/g, '').substr(2, 9);
    const response = {
      code: 0,
      msg: null,
      orderId
    };
    logApiCall('outgoing', `${config.baseUrl}/Api/SOrder/mybuysim`, 'POST', payload, response, 'success');
    return response;
  }
  
  return postRequest('/Api/SOrder/mybuysim', payload);
}

// 5.1 Top-up SIM Card
export async function topupSim(prodList) {
  const config = getApiConfig();
  
  let prodListStr = "";
  prodList.forEach(item => {
    prodListStr += (item.wmproductId + item.day + item.simNum);
  });
  
  const signatureBase = config.merchantId + config.deptId + prodListStr + config.token;
  const encStr = await calculateSHA1(signatureBase);
  
  const payload = {
    merchantId: config.merchantId,
    deptId: config.deptId,
    prodList,
    encStr
  };
  
  if (config.isSimulator) {
    const orderId = "b" + config.merchantId + "top" + new Date().toISOString().replace(/[^0-9]/g, '').substr(2, 9);
    const response = {
      code: 0,
      msg: null,
      orderId
    };
    logApiCall('outgoing', `${config.baseUrl}/Api/SOrder/mydeposit`, 'POST', payload, response, 'success');
    
    // Simulate webhook callback after 2 seconds
    setTimeout(() => {
      simulateCallback('deposit', { orderId, prodList });
    }, 2000);
    
    return response;
  }
  
  return postRequest('/Api/SOrder/mydeposit', payload);
}

// 5.3 Remote Activation
export async function remoteActivation(simNum, orderId, mcc = "345") {
  const config = getApiConfig();
  const signatureBase = config.merchantId + simNum + orderId + mcc + config.token;
  const encStr = await calculateSHA1(signatureBase);
  
  const payload = {
    merchantId: config.merchantId,
    simNum,
    orderId,
    mcc,
    encStr
  };
  
  if (config.isSimulator) {
    const response = {
      code: 0,
      msg: "成功"
    };
    logApiCall('outgoing', `${config.baseUrl}/Api/SimOperate/simRemoteActiv`, 'POST', payload, response, 'success');
    return response;
  }
  
  return postRequest('/Api/SimOperate/simRemoteActiv', payload);
}

// 5.4 Traffic Reset
export async function trafficReset(simNum, orderId) {
  const config = getApiConfig();
  const signatureBase = config.merchantId + simNum + orderId + config.token;
  const encStr = await calculateSHA1(signatureBase);
  
  const payload = {
    merchantId: config.merchantId,
    simNum,
    orderId,
    encStr
  };
  
  if (config.isSimulator) {
    const response = {
      code: 0,
      msg: "已申請流量重置，請主動通知世界移動",
      depositMap: 1
    };
    logApiCall('outgoing', `${config.baseUrl}/Api/SimOperate/simTrafficReset`, 'POST', payload, response, 'success');
    return response;
  }
  
  return postRequest('/Api/SimOperate/simTrafficReset', payload);
}

// 6.1 Usage and Status
export async function queryUsage(simNum = '', rcode = '', iccid = '', cid = '', orderId = '') {
  const config = getApiConfig();
  
  let signatureBase = "";
  if (simNum) {
    signatureBase = config.merchantId + simNum + orderId + config.token;
  } else {
    // Virtual eSIM encryption signature
    signatureBase = config.merchantId + rcode + config.token;
  }
  const encStr = await calculateSHA1(signatureBase);
  
  const payload = {
    merchantId: config.merchantId,
    simNum,
    rcode,
    iccid,
    cid,
    orderId,
    encStr
  };
  
  if (config.isSimulator) {
    const targetCid = cid || iccid || simNum;
    const cardData = mockStore.simCards[targetCid] || {
      status: 1,
      couponStatus: 2,
      firmName: "World Move",
      cid: targetCid || "89851100002002009999",
      useSDate: "1715914638000",
      useEDate: "1717171199000",
      totalUsage: "21531551384",
      device: "iPhone 14 Pro",
      eid: "89049032007008882600140004945097"
    };
    
    const response = {
      code: 0,
      msg: null,
      cid: cardData.cid,
      useSDate: cardData.useSDate || "1715914638000",
      useEDate: cardData.useEDate || "1717171199000",
      totalUsage: cardData.totalUsage,
      esimStatus: cardData.status,
      simStatus: cardData.status,
      productType: simNum ? 2 : 0,
      itemList: [
        { usageDate: "20260624", mcc: "460", code: "CN", zhtw: "中國", enus: "China", usage: "3024446023" },
        { usageDate: "20260623", mcc: "460", code: "CN", zhtw: "中國", enus: "China", usage: "3750896913" },
        { usageDate: "20260622", mcc: "460", code: "CN", zhtw: "中國", enus: "China", usage: "2869333767" }
      ]
    };
    
    logApiCall('outgoing', `${config.baseUrl}/Api/UseageDetail/queryUsage`, 'POST', payload, response, 'success');
    return response;
  }
  
  return postRequest('/Api/UseageDetail/queryUsage', payload);
}

// 6.2 eSIM Basic Info
export async function queryBasicInfo(rcode = '', iccid = '', cid = '') {
  const config = getApiConfig();
  const key = rcode || iccid || cid;
  const signatureBase = config.merchantId + key + config.token;
  const encStr = await calculateSHA1(signatureBase);
  
  const payload = {
    merchantId: config.merchantId,
    rcode,
    iccid,
    cid,
    encStr
  };
  
  if (config.isSimulator) {
    const cardData = mockStore.simCards[key] || {
      status: 1,
      couponStatus: 2,
      firmName: "World Move",
      cid: key || "8985100000000357xxxx",
      useSDate: "1715914638000",
      useEDate: "1717171199000",
      totalUsage: "0",
      device: "iPhone 14 Pro",
      eid: "89049032007008882600140004945097"
    };
    
    const response = {
      code: 0,
      msg: null,
      firmName: cardData.firmName,
      cid: cardData.cid,
      status: cardData.status,
      couponStatus: cardData.couponStatus,
      eid: cardData.eid || "89049032007008882600140004945097",
      device: cardData.device || "iPhone 14 Pro"
    };
    
    logApiCall('outgoing', `${config.baseUrl}/Api/UseageDetail/queryBasicInfo`, 'POST', payload, response, 'success');
    return response;
  }
  
  return postRequest('/Api/UseageDetail/queryBasicInfo', payload);
}

// 6.3 eSIM Progress Event
export async function queryEsimProgresses(rcode = '', iccid = '', cid = '') {
  const config = getApiConfig();
  const key = rcode || iccid || cid;
  const signatureBase = config.merchantId + key + config.token;
  const encStr = await calculateSHA1(signatureBase);
  
  const payload = {
    merchantId: config.merchantId,
    rcode,
    iccid,
    cid,
    encStr
  };
  
  if (config.isSimulator) {
    const events = mockStore.progressEvents[key] || [
      { cid: key || "8985100000000357xxxx", eid: "89049032007008882600125701275506", progressDate: "2026-06-24 05:34:50", notificationPointid: 3, status: "Executed-Success" },
      { cid: key || "8985100000000357xxxx", eid: "89049032007008882600125701275506", progressDate: "2026-06-24 05:35:07", notificationPointid: 4, status: "Executed-Success" },
      { cid: key || "8985100000000357xxxx", eid: "89049032007008882600125701275506", progressDate: "2026-06-24 05:35:11", notificationPointid: 6, status: "Executed-Success" }
    ];
    
    const response = {
      code: 0,
      msg: null,
      esimProgresses: events
    };
    
    logApiCall('outgoing', `${config.baseUrl}/Api/UseageDetail/queryEsimProgresses`, 'POST', payload, response, 'success');
    return response;
  }
  
  return postRequest('/Api/UseageDetail/queryEsimProgresses', payload);
}

// 6.4 Verify card number correctness
export async function verifySimCard(simNum) {
  const config = getApiConfig();
  const signatureBase = config.merchantId + simNum + config.token;
  const encStr = await calculateSHA1(signatureBase);
  
  const payload = {
    merchantId: config.merchantId,
    simNum,
    encStr
  };
  
  if (config.isSimulator) {
    // If the number is the test environment failure card number, fail
    if (simNum === "81234567891234567891") {
      const response = {
        code: 411,
        msg: "SIM card number does not exist."
      };
      logApiCall('outgoing', `${config.baseUrl}/Api/SimQuery/simExists`, 'POST', payload, response, 'success');
      return response;
    }
    
    const response = {
      code: 0,
      msg: "成功"
    };
    logApiCall('outgoing', `${config.baseUrl}/Api/SimQuery/simExists`, 'POST', payload, response, 'success');
    return response;
  }
  
  return postRequest('/Api/SimQuery/simExists', payload);
}
