import React, { useState, useEffect } from 'react';
import { Terminal, ChevronUp, ChevronDown, CheckCircle, AlertTriangle, Play, Copy, Trash2, ArrowRight } from 'lucide-react';
import { simulateCallback } from '../utils/api';

const ApiConsole = () => {
  const [logs, setLogs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  
  // Webhook simulator state
  const [simType, setSimType] = useState('order');
  const [simOrderId, setSimOrderId] = useState('');
  const [simProductId, setSimProductId] = useState('WM_000001');
  const [simQty, setSimQty] = useState(1);
  const [simPhoneNum, setSimPhoneNum] = useState('89851100002002001111');
  const [simDays, setSimDays] = useState(5);

  useEffect(() => {
    const handleApiLog = (e) => {
      setLogs((prev) => [e.detail, ...prev].slice(0, 100)); // Limit to 100 logs
      // Auto open if it's the first log or we want active inspection
      if (logs.length === 0) {
        setIsOpen(true);
      }
    };

    window.addEventListener('api-log', handleApiLog);
    return () => {
      window.removeEventListener('api-log', handleApiLog);
    };
  }, [logs]);

  const handleClearLogs = () => {
    setLogs([]);
    setSelectedLog(null);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    alert('Đã sao chép vào bộ nhớ tạm!');
  };

  const triggerSimulate = async () => {
    if (!simOrderId) {
      alert('Vui lòng điền mã đơn hàng (OrderId) cần giả lập callback!');
      return;
    }

    let payload = { orderId: simOrderId };
    if (simType === 'order') {
      payload.email = 'customer_test@example.com';
      payload.prodList = [{ wmproductId: simProductId, qty: Number(simQty) }];
    } else if (simType === 'orderRedeem') {
      payload.qrcodeType = 2;
      payload.prodList = [{ wmproductId: simProductId, qty: Number(simQty) }];
    } else if (simType === 'deposit') {
      payload.prodList = [{ wmproductId: simProductId, day: Number(simDays), simNum: simPhoneNum }];
    }

    try {
      await simulateCallback(simType, payload);
      alert('Đã phát tín hiệu webhook callback giả lập thành công!');
    } catch (err) {
      alert('Lỗi khi gửi callback giả lập: ' + err.message);
    }
  };

  return (
    <div className={`api-console-wrapper ${isOpen ? 'open' : 'collapsed'}`} style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: isOpen ? '380px' : '40px',
      backgroundColor: '#15191e',
      borderTop: '2px solid var(--teal-primary)',
      color: '#d1d5db',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      transition: 'height 0.25s ease-in-out',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
    }}>
      
      {/* Header bar */}
      <div className="console-header" onClick={() => setIsOpen(!isOpen)} style={{
        height: '40px',
        backgroundColor: '#1b222a',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        userSelect: 'none',
        borderBottom: isOpen ? '1px solid #2d3748' : 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--teal-primary)' }}>
          <Terminal size={16} />
          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>BẢNG ĐIỀU KHIỂN API & GIẢ LẬP WEBHOOK CALLBACK</span>
          {logs.length > 0 && (
            <span style={{ backgroundColor: 'rgba(32, 158, 145, 0.2)', color: 'var(--teal-primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>
              {logs.length} logs
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} onClick={(e) => e.stopPropagation()}>
          {isOpen && (
            <button className="btn btn-reset btn-red" style={{ height: '24px', padding: '0 8px', fontSize: '10px', gap: '3px' }} onClick={handleClearLogs}>
              <Trash2 size={10} />
              <span>Xóa Logs</span>
            </button>
          )}
          <span onClick={() => setIsOpen(!isOpen)} style={{ color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
            {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </span>
        </div>
      </div>

      {/* Main Console Content */}
      {isOpen && (
        <div className="console-body" style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden'
        }}>
          {/* Webhook Simulator Section (Left) */}
          <div className="simulator-panel" style={{
            width: '280px',
            borderRight: '1px solid #2d3748',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#1b222a',
            overflowY: 'auto'
          }}>
            <h4 style={{ margin: '0 0 5px 0', color: 'var(--orange-primary)', fontSize: '13px', fontWeight: 'bold', borderBottom: '1px dashed #4b5563', paddingBottom: '5px' }}>
              Giả lập Webhook Callback
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', color: '#9ca3af' }}>Loại Callback</label>
              <select 
                value={simType} 
                onChange={(e) => setSimType(e.target.value)} 
                style={{ backgroundColor: '#2d3748', color: '#fff', border: '1px solid #4b5563', padding: '4px', borderRadius: '3px' }}
              >
                <option value="order">eSIM Order Callback (2.2)</option>
                <option value="orderRedeem">eSIM Order & Redeem Callback (2.5)</option>
                <option value="deposit">Top-up SIM Callback (5.2)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', color: '#9ca3af' }}>Mã Đơn hàng (OrderId)</label>
              <input 
                type="text" 
                placeholder="b0002..." 
                value={simOrderId} 
                onChange={(e) => setSimOrderId(e.target.value)} 
                style={{ backgroundColor: '#2d3748', color: '#fff', border: '1px solid #4b5563', padding: '4px', borderRadius: '3px' }}
              />
            </div>

            {simType === 'deposit' ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: '#9ca3af' }}>Số thẻ SIM (simNum)</label>
                  <input 
                    type="text" 
                    value={simPhoneNum} 
                    onChange={(e) => setSimPhoneNum(e.target.value)} 
                    style={{ backgroundColor: '#2d3748', color: '#fff', border: '1px solid #4b5563', padding: '4px', borderRadius: '3px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: '#9ca3af' }}>Số ngày nạp (day)</label>
                  <input 
                    type="number" 
                    value={simDays} 
                    onChange={(e) => setSimDays(e.target.value)} 
                    style={{ backgroundColor: '#2d3748', color: '#fff', border: '1px solid #4b5563', padding: '4px', borderRadius: '3px' }}
                  />
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: '#9ca3af' }}>Sản phẩm (wmproductId)</label>
                  <select 
                    value={simProductId} 
                    onChange={(e) => setSimProductId(e.target.value)} 
                    style={{ backgroundColor: '#2d3748', color: '#fff', border: '1px solid #4b5563', padding: '4px', borderRadius: '3px' }}
                  >
                    <option value="WM_000001">Japan eSIM (WM_000001)</option>
                    <option value="WM_000003">Global eSIM (WM_000003)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: '#9ca3af' }}>Số lượng (qty)</label>
                  <input 
                    type="number" 
                    value={simQty} 
                    onChange={(e) => setSimQty(e.target.value)} 
                    style={{ backgroundColor: '#2d3748', color: '#fff', border: '1px solid #4b5563', padding: '4px', borderRadius: '3px' }}
                  />
                </div>
              </>
            )}

            <button 
              className="btn btn-teal" 
              style={{ marginTop: '5px', height: '28px', gap: '5px', alignSelf: 'stretch', justifyContent: 'center' }} 
              onClick={triggerSimulate}
            >
              <Play size={12} />
              <span>Gửi Callback về App</span>
            </button>
          </div>

          {/* Logs List Section (Middle) */}
          <div className="logs-list-panel" style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px',
            backgroundColor: '#11151b'
          }}>
            {logs.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', flexDirection: 'column', gap: '8px' }}>
                <Terminal size={24} />
                <span>Chưa phát sinh phiên gọi API nào. Thực hiện các thao tác trên ứng dụng để xem log.</span>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2d3748', color: '#9ca3af', fontSize: '10px' }}>
                    <th style={{ padding: '6px' }}>Thời gian</th>
                    <th style={{ padding: '6px' }}>Chiều</th>
                    <th style={{ padding: '6px' }}>API Endpoint / Webhook</th>
                    <th style={{ padding: '6px', textAlign: 'center' }}>Mã Code</th>
                    <th style={{ padding: '6px', textAlign: 'center' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const isCallback = log.direction === 'incoming';
                    const endpoint = log.url.split('.com.tw').pop() || log.url;
                    
                    return (
                      <tr key={log.id} 
                        onClick={() => setSelectedLog(log)}
                        style={{ 
                          borderBottom: '1px solid #1e293b', 
                          cursor: 'pointer',
                          backgroundColor: selectedLog?.id === log.id ? 'rgba(32, 158, 145, 0.1)' : 'transparent',
                          transition: 'background 0.15s'
                        }}
                        className="log-row-hover"
                      >
                        <td style={{ padding: '8px 6px', color: '#6b7280' }}>{log.timestamp}</td>
                        <td style={{ padding: '8px 6px' }}>
                          <span style={{ 
                            fontSize: '9px',
                            fontWeight: 'bold',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            backgroundColor: isCallback ? 'rgba(240, 173, 78, 0.15)' : 'rgba(32, 158, 145, 0.15)',
                            color: isCallback ? 'var(--orange-primary)' : 'var(--teal-primary)',
                            border: isCallback ? '1px solid rgba(240, 173, 78, 0.3)' : '1px solid rgba(32, 158, 145, 0.3)'
                          }}>
                            {isCallback ? 'CALLBACK' : 'REQUEST'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 6px', fontWeight: '500', color: isCallback ? '#f0ad4e' : '#fff' }}>
                          {endpoint}
                        </td>
                        <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                          {log.responseBody?.code === 0 || log.responseBody === "1" ? (
                            <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <CheckCircle size={10} /> 0
                            </span>
                          ) : (
                            <span style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <AlertTriangle size={10} /> {log.responseBody?.code || 'ERR'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                          <button className="btn btn-teal" style={{ height: '18px', padding: '0 6px', fontSize: '9px' }}>Chi tiết</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Details Inspector (Right) */}
          {selectedLog && (
            <div className="inspector-panel" style={{
              width: '380px',
              borderLeft: '1px solid #2d3748',
              backgroundColor: '#1b222a',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '10px', borderBottom: '1px solid #2d3748', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#15191e' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--teal-primary)' }}>CHI TIẾT PHIÊN GỌI</span>
                <span style={{ cursor: 'pointer', color: '#9ca3af' }} onClick={() => setSelectedLog(null)}>×</span>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '3px' }}>URL Điểm cuối</div>
                  <div style={{ wordBreak: 'break-all', color: '#fff', fontSize: '11px' }}>{selectedLog.url}</div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>Dữ liệu gửi đi (Request Payload)</span>
                    <button onClick={() => handleCopy(selectedLog.requestBody)} style={{ background: 'none', border: 'none', color: 'var(--teal-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}>
                      <Copy size={10} /> copy
                    </button>
                  </div>
                  <pre style={{ margin: 0, padding: '8px', backgroundColor: '#11151b', borderRadius: '4px', overflowX: 'auto', maxHeight: '120px', fontSize: '11px', color: '#a78bfa' }}>
                    {JSON.stringify(selectedLog.requestBody, null, 2)}
                  </pre>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>Kết quả trả về (Response Payload)</span>
                    <button onClick={() => handleCopy(selectedLog.responseBody)} style={{ background: 'none', border: 'none', color: 'var(--teal-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}>
                      <Copy size={10} /> copy
                    </button>
                  </div>
                  <pre style={{ margin: 0, padding: '8px', backgroundColor: '#11151b', borderRadius: '4px', overflowX: 'auto', maxHeight: '120px', fontSize: '11px', color: '#34d399' }}>
                    {typeof selectedLog.responseBody === 'string' 
                      ? selectedLog.responseBody 
                      : JSON.stringify(selectedLog.responseBody, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiConsole;
