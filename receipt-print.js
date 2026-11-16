/* Browser printing through the printer installed on the viewing computer. */
function openSpecimenReceipt({ image, number, source, operations, detected, trait }) {
  const receiptWindow = window.open('', '_blank', 'width=480,height=800');
  if (!receiptWindow) return false;
  const doc = receiptWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>표본 출력 / SPECIMEN RECEIPT</title>
  <style>
    * { box-sizing: border-box; } body { margin:0; background:#e7e7e7; color:#000; font-family:Arial,sans-serif; }
    .controls { padding:20px; max-width:480px; margin:auto; font-size:14px; line-height:1.6; }
    button { padding:10px 18px; font:inherit; cursor:pointer; } .controls p { margin:12px 0; }
    .receipt { width:80mm; height:180mm; padding:4mm; margin:20px auto; background:#fff; }
    header { border-bottom:1px dashed #000; padding-bottom:3mm; } h1 { font-size:18px; margin:0 0 2mm; } p { margin:2mm 0; font-size:11px; line-height:1.5; }
    #specimenImage { display:block; width:70mm; height:70mm; object-fit:contain; margin:4mm auto; }
    dl { border-top:1px dashed; margin:0; padding-top:2mm; font-size:11px; } dl div { display:flex; justify-content:space-between; gap:3mm; padding:1mm 0; } dt { flex:none; } dd { margin:0; text-align:right; overflow-wrap:anywhere; }
    footer p { white-space:nowrap; }
    footer { border-top:1px dashed; margin-top:3mm; padding-top:2mm; }
    @page { size:80mm 180mm; margin:0; }
    @media print { html, body { width:80mm; margin:0; background:#fff; } .controls { display:none; } .receipt { margin:0; height:180mm; break-inside:avoid; } }
  </style></head><body><div class="controls"><button id="printReceipt" disabled>인쇄 / PRINT</button><p>프린터: BIXOLON SRP-330II · 용지: 80 × 180mm (가로 × 세로)<br>인쇄창에서 사용자 정의 용지를 80 × 180mm로 지정하세요. 배율 100%, 여백 0, 머리글·바닥글 끄기.</p><p id="printFeedback" role="status">이미지를 준비하고 있습니다.</p></div><article class="receipt"><header><h1>SPECIMEN ARCHIVE</h1><p>박제 / GRAPHIC TAXIDERMY</p><p id="receiptNumber"></p><p id="receiptDate"></p></header><img id="specimenImage" alt="편집한 표본"><dl id="receiptData"></dl><footer><p>pinned: 박제되는 이미지</p></footer></article></body></html>`);
  doc.close();
  doc.querySelector('#receiptNumber').textContent = number || '미등록 표본 / UNREGISTERED SPECIMEN';
  doc.querySelector('#receiptDate').textContent = new Date().toLocaleString('ko-KR', { timeZone:'Asia/Seoul', hour12:false });
  const rows = [
    ['입력 / INPUT', source === 'upload' ? '이미지 / IMAGE' : '카메라 / CAMERA'],
    ['선택 영역 / DETECTED', detected], ['고정 / FIX', operations.fix],
    ['전개 / EXPAND', operations.expand], ['보존 / PRESERVE', operations.preserve],
    ['특이형질 / TRAIT', operations.trait], ['최근 형질 / LAST TRAIT', trait]
  ];
  for (const [label,value] of rows) {
    const row=doc.createElement('div'), dt=doc.createElement('dt'), dd=doc.createElement('dd');
    dt.textContent=label; dd.textContent=String(value); row.append(dt,dd); doc.querySelector('#receiptData').append(row);
  }
  const img=doc.querySelector('#specimenImage');
  const button=doc.querySelector('#printReceipt');
  const feedback=doc.querySelector('#printFeedback');
  img.onload=()=>{button.disabled=false;feedback.textContent='표본이 준비되었습니다. 인쇄 버튼을 눌러 프린터를 선택하세요.';};
  img.onerror=()=>{feedback.textContent='이미지를 불러오지 못했습니다. 창을 닫고 다시 시도하세요.';};
  img.src=image;
  let printing = false;
  let leftWindow = false;
  let enteredPrintMedia = false;
  let closeTimer;
  let archiveNoticeSent = false;
  const printMedia = receiptWindow.matchMedia('print');
  const closeReceipt = () => {
    if (!printing || receiptWindow.closed) return;
    if (!archiveNoticeSent && number && receiptWindow.opener && !receiptWindow.opener.closed) {
      archiveNoticeSent = true;
      receiptWindow.opener.postMessage({ type: 'specimen-printed', id: number }, location.origin);
    }
    receiptWindow.close();
  };
  const closeAfterReturn = () => {
    if (!printing || !leftWindow) return;
    receiptWindow.clearTimeout(closeTimer);
    closeTimer = receiptWindow.setTimeout(() => {
      if (!printMedia.matches && doc.hasFocus()) closeReceipt();
    }, 350);
  };
  // Browsers differ: use print completion, print-media exit, and return of focus.
  receiptWindow.addEventListener('afterprint', closeReceipt);
  printMedia.addEventListener('change', event => {
    if (!printing) return;
    if (event.matches) enteredPrintMedia = true;
    else if (enteredPrintMedia) closeReceipt();
  });
  receiptWindow.addEventListener('blur', () => {
    if (printing) leftWindow = true;
  });
  receiptWindow.addEventListener('focus', closeAfterReturn);
  doc.addEventListener('visibilitychange', () => {
    if (printing && doc.hidden) leftWindow = true;
    else closeAfterReturn();
  });
  button.addEventListener('click', () => {
    if (printing) return;
    receiptWindow.focus();
    printing = true;
    leftWindow = false;
    enteredPrintMedia = false;
    button.disabled = true;
    try {
      const started = Date.now();
      receiptWindow.print();
      // Some native dialogs block print() without emitting afterprint.
      // Immediate returns are asynchronous dialogs and must stay open.
      if (Date.now() - started > 1000 && !printMedia.matches) closeReceipt();
    } catch (error) {
      printing = false;
      receiptWindow.clearTimeout(closeTimer);
      button.disabled = false;
      feedback.textContent = '인쇄창을 열지 못했습니다. 다시 시도하세요.';
      console.error(error);
    }
  });
  return true;
}
