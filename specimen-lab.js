/* =========================================================
   SPECIMEN LAB
========================================================= */


/* =========================================================
   HELPERS
========================================================= */

const lab$ = (
  selector,
  root = document
) => root.querySelector(selector);


const lab$$ = (
  selector,
  root = document
) => [
  ...root.querySelectorAll(selector)
];


/* =========================================================
   DOM
========================================================= */

const cameraButton =
  lab$('#cameraButton');

const uploadButton = lab$('#uploadButton');
const imageUploadInput = lab$('#imageUploadInput');

const camera =
  lab$('#camera');

const canvas =
  lab$('#specimenCanvas');


const ctx =
  canvas
    ? canvas.getContext(
        '2d',
        {
          willReadFrequently: true
        }
      )
    : null;


const captureArea =
  lab$('#captureArea');

const cameraPlaceholder =
  lab$('#cameraPlaceholder');

const captureButton =
  lab$('#captureButton');

const captureStatus =
  lab$('#captureStatus');

const undoButton =
  lab$('#undoButton');

const recaptureButton =
  lab$('#recaptureButton');

const printButton = lab$('#printButton');

const registerButton =
  lab$('#registerButton');

const systemStatus =
  lab$('#systemStatus');

const statusDot =
  lab$('#statusDot');

const labMessage =
  lab$('#labMessage');

const canvasMode =
  lab$('#canvasMode');


const labTools =
  lab$$('.lab-tool');


const activeToolName =
  lab$('#activeToolName');

const activeToolDescription =
  lab$('#activeToolDescription');


const specimenStateText =
  lab$('#specimenStateText');

const specimenToolText =
  lab$('#specimenToolText');

const specimenBrushText =
  lab$('#specimenBrushText');


const brushSize =
  lab$('#brushSize');

const brushSizeValue =
  lab$('#brushSizeValue');

const brushPreviewCircle =
  lab$('#brushPreviewCircle');

const brushCursor =
  lab$('#brushCursor');


const detectLayer =
  lab$('#detectLayer');

const pinLayer =
  lab$('#pinLayer');


const trackX =
  lab$('#trackX');

const trackY =
  lab$('#trackY');


const detectOperationCount =
  lab$('#detectOperationCount');

const fixOperationCount =
  lab$('#fixOperationCount');

const expandOperationCount =
  lab$('#expandOperationCount');

const preserveOperationCount =
  lab$('#preserveOperationCount');

const traitOperationCount =
  lab$('#traitOperationCount');

const lastTraitText =
  lab$('#lastTraitText');


const labCursor =
  lab$('.glass-neon-cursor');


/* =========================================================
   STATE
========================================================= */

const specimenLab = {

  stream: null,

  captured: false,

  archiveId: null,

  inputSource: null,

  inputBusy: false,

  activeTool: 'capture',

  brushSize: 80,

  history: [],

  detectRegions: [],

  previewDetectRegion: null,

  traitHistory: [],

  lastTrait: null,

  detectDragging: false,

  detectStart: null,

  expandDragging: false,

  expandStart: null,

  preserveDragging: false,

  operations: {

    fix: 0,

    expand: 0,

    preserve: 0,

    trait: 0

  }

};


const toolKorean = {
  capture: '촬영', detect: '인식', fix: '고정',
  expand: '전개', preserve: '보존', trait: '특이형질'
};

const toolGuidance = {
  capture: '카메라로 촬영하거나 이미지를 업로드하세요. / Capture or upload an image.',
  detect: '이미지 위를 드래그해 작업 영역을 지정하세요. / Drag on the image to select an area.',
  fix: '선택 영역 안을 클릭해 고정점을 추가하세요. / Click inside a selected area to add a pin.',
  expand: '선택 영역 안을 드래그해 형태를 늘리세요. / Drag inside a selected area to expand the image.',
  preserve: '선택 영역 안을 드래그해 밀도와 대비를 바꾸세요. / Drag inside a selected area to adjust density and contrast.',
  trait: '선택 영역 안을 클릭해 특이형질을 만드세요. / Click inside a selected area to generate a trait.'
};

const traitKorean = {
  GRAIN: '입자', 'PATTERN LOSS': '패턴 소실', DENSITY: '밀도',
  STRIPE: '줄무늬', CELL: '세포', DISPLACEMENT: '변위'
};

function bilingualTrait(trait) {
  return trait ? `${traitKorean[trait]} / ${trait}` : '없음 / NONE';
}

const MAX_HISTORY =
  10;


/* =========================================================
   TOOL INFO
========================================================= */

const specimenToolInfo = {

  capture: {

    name:
      'CAPTURE',

    text:
      '카메라로 촬영하거나 JPG, PNG, WebP 이미지를 업로드합니다.'

  },


  detect: {

    name:
      'DETECT',

    text:
      '드래그해 작업 영역을 지정합니다. 여러 영역을 계속 추가할 수 있습니다.'

  },


  fix: {

    name:
      'FIX',

    text:
      '선택된 영역 안에 고정점을 추가합니다.'

  },


  expand: {

    name:
      'EXPAND',

    text:
      '선택 영역 안에서 구조를 늘리고 전개합니다.'

  },


  preserve: {

    name:
      'PRESERVE',

    text:
      '선택 영역 안의 밀도와 대비를 변화시킵니다.'

  },


  trait: {

    name:
      'TRAIT',

    text:
      '선택 영역 안에 무작위 특이형질을 발생시킵니다.'

  }

};


/* =========================================================
   TRAITS
========================================================= */

const traitTypes = [

  'GRAIN',

  'PATTERN LOSS',

  'DENSITY',

  'STRIPE',

  'CELL',

  'DISPLACEMENT'

];


/* =========================================================
   CURSOR
========================================================= */

if (
  labCursor &&
  window.matchMedia(
    '(pointer: fine)'
  ).matches
) {

  document.addEventListener(
    'mousemove',
    event => {

      labCursor.style.left =
        `${event.clientX}px`;

      labCursor.style.top =
        `${event.clientY}px`;

    }
  );


  document.addEventListener(
    'mousedown',
    () => {

      labCursor.classList.add(
        'active'
      );

    }
  );


  document.addEventListener(
    'mouseup',
    () => {

      labCursor.classList.remove(
        'active'
      );

    }
  );


  lab$$(
    'a, button, input'
  ).forEach(
    element => {

      element.addEventListener(
        'mouseenter',
        () => {

          labCursor.classList.add(
            'hover'
          );

        }
      );


      element.addEventListener(
        'mouseleave',
        () => {

          labCursor.classList.remove(
            'hover'
          );

        }
      );

    }
  );

}


/* =========================================================
   CAMERA
========================================================= */

async function enableSpecimenCamera() {

  if (specimenLab.inputBusy) return;

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    systemStatus.textContent =
      'CAMERA UNSUPPORTED';

    labMessage.textContent =
      'localhost 또는 HTTPS에서 실행하세요. / Use localhost or HTTPS.';

    return;

  }


  setInputBusy(true);

  try {

    systemStatus.textContent =
      'REQUESTING CAMERA';


    specimenLab.stream =
      await navigator.mediaDevices
        .getUserMedia({

          video: {

            facingMode:
              'user',

            width: {
              ideal: 1280
            },

            height: {
              ideal: 1280
            }

          },

          audio:
            false

        });


    camera.srcObject =
      specimenLab.stream;


    await new Promise(
      resolve => {

        if (
          camera.readyState >= 2
        ) {

          resolve();

          return;

        }


        camera.addEventListener(
          'loadedmetadata',
          resolve,
          {
            once: true
          }
        );

      }
    );


    await camera.play();

    if (specimenLab.captured) await recaptureSpecimen();


    camera.classList.add(
      'is-active'
    );


    canvas.classList.remove(
      'is-active'
    );


    cameraPlaceholder.classList.add(
      'is-hidden'
    );


    statusDot.classList.remove(
      'off'
    );


    cameraButton.textContent =
      'DISABLE CAMERA';


    captureButton.disabled =
      false;


    captureStatus.textContent =
      'LIVE INPUT';


    systemStatus.textContent =
      'CAMERA READY';


    specimenStateText.textContent =
      '실시간 / LIVE';


    canvasMode.textContent =
      'LIVE INPUT';


    labMessage.textContent =
      '표본을 프레임 안에 배치한 뒤 촬영하세요. / Place the specimen in the frame and capture.';

  }

  catch (error) {

    disableSpecimenCamera();

    console.error(
      error
    );


    statusDot.classList.add(
      'off'
    );


    systemStatus.textContent =
      'CAMERA ERROR';


    labMessage.textContent =
      '카메라 권한을 확인하거나 이미지를 업로드하세요. / Check camera access or upload an image.';

  }

  finally {
    setInputBusy(false);
  }

}


function disableSpecimenCamera() {

  specimenLab.stream
    ?.getTracks()
    .forEach(
      track =>
        track.stop()
    );


  specimenLab.stream =
    null;


  camera.pause();

  camera.srcObject =
    null;


  camera.classList.remove(
    'is-active'
  );


  cameraPlaceholder.classList.toggle('is-hidden', specimenLab.captured);


  cameraButton.textContent =
    'ENABLE CAMERA';


  captureButton.disabled =
    true;


  if (specimenLab.captured) return;

  captureStatus.textContent =
    'CAMERA OFF';


  systemStatus.textContent =
    'SYSTEM READY';


  statusDot.classList.add(
    'off'
  );

}


cameraButton?.addEventListener(
  'click',
  async () => {

    if (
      specimenLab.stream
    ) {

      disableSpecimenCamera();

    }

    else {

      await enableSpecimenCamera();

    }

  }
);


/* =========================================================
   CAPTURE
========================================================= */

function captureSpecimenImage() {

  if (
    !specimenLab.stream ||
    !camera ||
    !canvas ||
    !ctx
  ) {

    return;

  }


  const videoWidth =
    camera.videoWidth;


  const videoHeight =
    camera.videoHeight;


  if (
    !videoWidth ||
    !videoHeight
  ) {

    return;

  }


  const canvasSize =
    900;


  canvas.width =
    canvasSize;


  canvas.height =
    canvasSize;


  const sourceSize =
    Math.min(
      videoWidth,
      videoHeight
    );


  const sourceX =
    (
      videoWidth -
      sourceSize
    ) /
    2;


  const sourceY =
    (
      videoHeight -
      sourceSize
    ) /
    2;


  ctx.save();


  ctx.translate(
    canvasSize,
    0
  );


  ctx.scale(
    -1,
    1
  );


  ctx.drawImage(

    camera,

    sourceX,
    sourceY,

    sourceSize,
    sourceSize,

    0,
    0,

    canvasSize,
    canvasSize

  );


  ctx.restore();


  completeSpecimenInput('camera');

}


function completeSpecimenInput(source) {

  printButton.disabled = false;

  const canvasSize = canvas.width;
  specimenLab.archiveId = null;
  specimenLab.inputSource = source;
  specimenLab.detectDragging = false;
  specimenLab.detectStart = null;
  specimenLab.previewDetectRegion = null;
  specimenLab.expandDragging = false;
  specimenLab.expandStart = null;
  specimenLab.preserveDragging = false;
  cameraPlaceholder.classList.add('is-hidden');

  const image =
    ctx.getImageData(

      0,
      0,

      canvasSize,
      canvasSize

    );


  const pixels =
    image.data;


  for (
    let i = 0;
    i < pixels.length;
    i += 4
  ) {

    const gray =
      pixels[i] * 0.299 +
      pixels[i + 1] * 0.587 +
      pixels[i + 2] * 0.114;


    pixels[i] =
      gray;

    pixels[i + 1] =
      gray;

    pixels[i + 2] =
      gray;

  }


  ctx.putImageData(
    image,
    0,
    0
  );


  specimenLab.captured =
    true;


  specimenLab.history =
    [];


  specimenLab.detectRegions =
    [];


  specimenLab.traitHistory =
    [];


  specimenLab.lastTrait =
    null;


  resetOperations();


  detectLayer.innerHTML =
    '';


  pinLayer.innerHTML =
    '';


  camera.classList.remove(
    'is-active'
  );


  canvas.classList.add(
    'is-active'
  );


  captureArea.classList.add(
    'is-captured'
  );


  enableTools();


  selectTool(
    'detect'
  );


  captureButton.disabled =
    true;


  undoButton.disabled =
    true;


  recaptureButton.disabled =
    false;


  registerButton.disabled =
    false;


  recaptureButton.textContent = source === 'upload' ? '이미지 교체 / REPLACE IMAGE' : '다시 촬영 / RECAPTURE';

  captureStatus.textContent =
    source === 'upload' ? 'IMAGE UPLOADED' : 'CAPTURED';


  specimenStateText.textContent =
    source === 'upload' ? '흑백 업로드 / B&W UPLOAD' : '흑백 촬영 / B&W CAPTURE';


  canvasMode.textContent =
    'MONO BITMAP';


  systemStatus.textContent =
    source === 'upload' ? 'IMAGE READY' : 'SPECIMEN CAPTURED';


  updateTraitUI();


  updateDetectCount();


  labMessage.textContent =
    '흑백 표본이 생성되었습니다. 작업 영역을 지정하세요. / Monochrome specimen ready. Select an area with DETECT.';

}


captureButton?.addEventListener(
  'click',
  captureSpecimenImage
);


/* =========================================================
   IMAGE UPLOAD
========================================================= */

function setInputBusy(busy) {
  specimenLab.inputBusy = busy;
  printButton.disabled = busy || !specimenLab.captured;
  cameraButton.disabled = busy;
  uploadButton.disabled = busy;
  recaptureButton.disabled = busy || !specimenLab.captured;
  captureButton.disabled = busy || specimenLab.captured || !specimenLab.stream;
  captureArea.setAttribute('aria-busy', String(busy));
}

function chooseSpecimenImage() {
  if (!specimenLab.inputBusy) imageUploadInput.click();
}

async function uploadSpecimenImage(file) {
  if (!file || specimenLab.inputBusy) return;

  const supported = /\.(jpe?g|png|webp)$/i;
  if (!(file.type ? ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) : supported.test(file.name))) {
    labMessage.textContent = 'JPG, PNG, WebP 이미지 파일을 선택하세요. / Choose a JPG, PNG, or WebP image.';
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    labMessage.textContent = '20MB 이하의 이미지를 선택하세요. / Choose an image up to 20MB.';
    return;
  }

  setInputBusy(true);
  labMessage.textContent = '이미지를 불러오는 중입니다. / Loading image.';
  let objectURL;
  try {
    objectURL = URL.createObjectURL(file);
    const image = new Image();
    image.src = objectURL;
    await image.decode();

    // Prepare before replacing the current edit so invalid files leave it intact.
    const prepared = document.createElement('canvas');
    prepared.width = prepared.height = 900;
    const preparedContext = prepared.getContext('2d');
    preparedContext.fillStyle = '#0d0d0d';
    preparedContext.fillRect(0, 0, 900, 900);
    const scale = Math.min(900 / image.naturalWidth, 900 / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    preparedContext.drawImage(image, (900 - width) / 2, (900 - height) / 2, width, height);

    disableSpecimenCamera();
    canvas.width = canvas.height = 900;
    ctx.drawImage(prepared, 0, 0);
    completeSpecimenInput('upload');
    labMessage.textContent = '흑백 이미지를 불러왔습니다. 작업 영역을 지정하세요. / Monochrome image ready. Select an area with DETECT.';
  } catch (error) {
    console.error(error);
    labMessage.textContent = '이미지를 읽을 수 없습니다. 다른 파일을 선택하세요. / Cannot read image. Choose another JPG, PNG, or WebP file.';
  } finally {
    if (objectURL) URL.revokeObjectURL(objectURL);
    setInputBusy(false);
  }
}

uploadButton?.addEventListener('click', chooseSpecimenImage);
imageUploadInput?.addEventListener('change', async () => {
  const file = imageUploadInput.files[0];
  imageUploadInput.value = '';
  await uploadSpecimenImage(file);
});


/* =========================================================
   TOOLS
========================================================= */

function enableTools() {

  labTools.forEach(
    tool => {

      if (
        tool.dataset.tool !==
        'capture'
      ) {

        tool.disabled =
          false;

      }

    }
  );

}


function disableTools() {

  labTools.forEach(
    tool => {

      if (
        tool.dataset.tool !==
        'capture'
      ) {

        tool.disabled =
          true;

      }

    }
  );

}


function selectTool(
  toolName
) {

  if (
    toolName !==
      'capture' &&
    !specimenLab.captured
  ) {

    return;

  }


  specimenLab.activeTool =
    toolName;


  labTools.forEach(
    tool => {

      tool.classList.toggle(

        'active',

        tool.dataset.tool ===
          toolName

      );

    }
  );


  const data =
    specimenToolInfo[
      toolName
    ];


  if (data) {

    activeToolName.textContent =
      data.name;


    activeToolDescription.textContent =
      data.text;

  }


  specimenToolText.textContent =
    `${toolKorean[toolName]} / ${toolName.toUpperCase()}`;


  updateBrushVisibility();

  labMessage.textContent = toolGuidance[toolName];

}


labTools.forEach(
  tool => {

    tool.addEventListener(
      'click',
      () => {

        if (
          tool.disabled
        ) {

          return;

        }


        selectTool(
          tool.dataset.tool
        );

      }
    );

  }
);


/* =========================================================
   HISTORY
========================================================= */

function saveHistory() {

  if (
    !specimenLab.captured
  ) {

    return;

  }


  const snapshot = {

    image:
      ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ),


    detectRegions:
      specimenLab.detectRegions.map(
        region => ({
          ...region
        })
      ),


    pins:
      [...pinLayer.children].map(
        pin => ({
          left:
            pin.style.left,

          top:
            pin.style.top
        })
      ),


    operations: {
      ...specimenLab.operations
    },


    traitHistory: [
      ...specimenLab.traitHistory
    ],


    lastTrait:
      specimenLab.lastTrait

  };


  specimenLab.history.push(
    snapshot
  );


  if (
    specimenLab.history.length >
    MAX_HISTORY
  ) {

    specimenLab.history.shift();

  }


  undoButton.disabled =
    false;

}


function undoSpecimen() {

  const previous =
    specimenLab.history.pop();


  if (!previous) {

    return;

  }


  ctx.putImageData(
    previous.image,
    0,
    0
  );


  specimenLab.detectRegions =
    previous.detectRegions.map(
      region => ({
        ...region
      })
    );


  specimenLab.operations = {
    ...previous.operations
  };


  specimenLab.traitHistory = [
    ...previous.traitHistory
  ];


  specimenLab.lastTrait =
    previous.lastTrait;


  pinLayer.innerHTML =
    '';


  previous.pins.forEach(
    pinData => {

      const pin =
        document.createElement(
          'div'
        );


      pin.className =
        'canvas-pin';


      pin.style.left =
        pinData.left;


      pin.style.top =
        pinData.top;


      pinLayer.appendChild(
        pin
      );

    }
  );


  renderDetectRegions();


  updateOperationUI();


  updateDetectCount();


  updateTraitUI();


  undoButton.disabled =
    specimenLab.history.length ===
    0;


  labMessage.textContent =
    '마지막 작업을 되돌렸습니다. / Last action undone.';

}


undoButton?.addEventListener(
  'click',
  undoSpecimen
);


document.addEventListener(
  'keydown',
  event => {

    const isUndo =
      (
        event.metaKey ||
        event.ctrlKey
      ) &&
      event.key.toLowerCase() ===
        'z';


    if (
      isUndo &&
      specimenLab.captured
    ) {

      event.preventDefault();


      undoSpecimen();

    }

  }
);


/* =========================================================
   DETECT MASK
========================================================= */

function isInsideDetectRegion(
  x,
  y
) {

  /*
    선택 영역이 없으면 전체 canvas 활성.
  */

  if (
    specimenLab.detectRegions.length ===
    0
  ) {

    return true;

  }


  return specimenLab.detectRegions.some(
    region => {

      return (

        x >=
          region.x &&

        x <=
          region.x +
          region.width &&

        y >=
          region.y &&

        y <=
          region.y +
          region.height

      );

    }
  );

}


/*
  사각형이 선택 영역과 겹치는지 검사.

  EXPAND 같은 영역 기반 처리용.
*/

function doesRectIntersectDetectRegion(
  x,
  y,
  width,
  height
) {

  if (
    specimenLab.detectRegions.length ===
    0
  ) {

    return true;

  }


  return specimenLab.detectRegions.some(
    region => {

      return !(

        x + width <
          region.x ||

        x >
          region.x +
          region.width ||

        y + height <
          region.y ||

        y >
          region.y +
          region.height

      );

    }
  );

}


/* =========================================================
   DETECT
========================================================= */

canvas?.addEventListener(
  'pointerdown',
  event => {

    if (
      !specimenLab.captured ||
      specimenLab.activeTool !==
        'detect'
    ) {

      return;

    }


    saveHistory();


    specimenLab.detectDragging =
      true;


    specimenLab.detectStart =
      getCanvasPosition(
        event
      );


    specimenLab.previewDetectRegion =
      document.createElement(
        'div'
      );


    specimenLab.previewDetectRegion.className =
      'detect-region is-preview';


    detectLayer.appendChild(
      specimenLab.previewDetectRegion
    );


    canvas.setPointerCapture(
      event.pointerId
    );

  }
);


canvas?.addEventListener(
  'pointermove',
  event => {

    if (
      !specimenLab.detectDragging ||
      specimenLab.activeTool !==
        'detect'
    ) {

      return;

    }


    const current =
      getCanvasPosition(
        event
      );


    updateDetectPreview(
      specimenLab.detectStart,
      current
    );

  }
);


canvas?.addEventListener(
  'pointerup',
  event => {

    if (
      !specimenLab.detectDragging
    ) {

      return;

    }


    specimenLab.detectDragging =
      false;


    const end =
      getCanvasPosition(
        event
      );


    const x =
      Math.min(
        specimenLab.detectStart.x,
        end.x
      );


    const y =
      Math.min(
        specimenLab.detectStart.y,
        end.y
      );


    const width =
      Math.abs(
        end.x -
        specimenLab.detectStart.x
      );


    const height =
      Math.abs(
        end.y -
        specimenLab.detectStart.y
      );


    specimenLab.previewDetectRegion
      ?.remove();


    specimenLab.previewDetectRegion =
      null;


    /*
      실수로 클릭만 한 정도의 작은 영역은 무시
    */

    if (
      width <
        8 ||
      height <
        8
    ) {

      /*
        방금 History가 저장되었으므로
        의미 없는 조작이면 그 History도 제거
      */

      specimenLab.history.pop();


      undoButton.disabled =
        specimenLab.history.length ===
        0;


      return;

    }


    specimenLab.detectRegions.push({

      x,

      y,

      width,

      height

    });


    renderDetectRegions();


    updateDetectCount();


    labMessage.textContent =
      `선택 영역 추가 / DETECTED AREA ${String(
        specimenLab.detectRegions.length
      ).padStart(2, '0')} ADDED`;

  }
);


function updateDetectPreview(
  start,
  current
) {

  if (
    !specimenLab.previewDetectRegion
  ) {

    return;

  }


  const rect =
    canvas.getBoundingClientRect();


  const scaleX =
    rect.width /
    canvas.width;


  const scaleY =
    rect.height /
    canvas.height;


  specimenLab.previewDetectRegion.style.left =
    `${
      Math.min(
        start.x,
        current.x
      ) *
      scaleX
    }px`;


  specimenLab.previewDetectRegion.style.top =
    `${
      Math.min(
        start.y,
        current.y
      ) *
      scaleY
    }px`;


  specimenLab.previewDetectRegion.style.width =
    `${
      Math.abs(
        current.x -
        start.x
      ) *
      scaleX
    }px`;


  specimenLab.previewDetectRegion.style.height =
    `${
      Math.abs(
        current.y -
        start.y
      ) *
      scaleY
    }px`;

}


function renderDetectRegions() {

  detectLayer.innerHTML =
    '';


  const rect =
    canvas.getBoundingClientRect();


  const scaleX =
    rect.width /
    canvas.width;


  const scaleY =
    rect.height /
    canvas.height;


  specimenLab.detectRegions.forEach(
    (region, index) => {

      const element =
        document.createElement(
          'div'
        );


      element.className =
        'detect-region';


      element.style.left =
        `${region.x * scaleX}px`;


      element.style.top =
        `${region.y * scaleY}px`;


      element.style.width =
        `${region.width * scaleX}px`;


      element.style.height =
        `${region.height * scaleY}px`;


      const label =
        document.createElement(
          'span'
        );


      label.className =
        'detect-region-label';


      label.textContent =
        `D${String(
          index + 1
        ).padStart(
          2,
          '0'
        )}`;


      element.appendChild(
        label
      );


      detectLayer.appendChild(
        element
      );

    }
  );

}


function updateDetectCount() {

  detectOperationCount.textContent =
    String(
      specimenLab.detectRegions.length
    ).padStart(
      2,
      '0'
    );

}


/* =========================================================
   BRUSH SIZE
========================================================= */

brushSize?.addEventListener(
  'input',
  () => {

    specimenLab.brushSize =
      Number(
        brushSize.value
      );


    const text =
      String(
        specimenLab.brushSize
      ).padStart(
        3,
        '0'
      );


    brushSizeValue.textContent =
      text;


    specimenBrushText.textContent =
      text;


    const preview =
      Math.max(
        12,
        specimenLab.brushSize *
        0.27
      );


    brushPreviewCircle.style.width =
      `${preview}px`;


    brushPreviewCircle.style.height =
      `${preview}px`;


    updateBrushCursorSize();

  }
);


function updateBrushCursorSize() {

  if (
    !canvas.width
  ) {

    return;

  }


  const rect =
    canvas.getBoundingClientRect();


  const scale =
    rect.width /
    canvas.width;


  const size =
    specimenLab.brushSize *
    scale;


  brushCursor.style.width =
    `${size}px`;


  brushCursor.style.height =
    `${size}px`;

}


function updateBrushVisibility() {

  const brushTools = [

    'expand',

    'preserve',

    'trait'

  ];


  brushCursor.classList.toggle(

    'visible',

    specimenLab.captured &&
    brushTools.includes(
      specimenLab.activeTool
    )

  );

}


/* =========================================================
   POSITION
========================================================= */

function getCanvasPosition(
  event
) {

  const rect =
    canvas.getBoundingClientRect();


  return {

    x:
      (
        event.clientX -
        rect.left
      ) *
      (
        canvas.width /
        rect.width
      ),


    y:
      (
        event.clientY -
        rect.top
      ) *
      (
        canvas.height /
        rect.height
      ),


    screenX:
      event.clientX -
      rect.left,


    screenY:
      event.clientY -
      rect.top

  };

}


/* =========================================================
   POINTER TRACKING
========================================================= */

canvas?.addEventListener(
  'pointermove',
  event => {

    if (
      !specimenLab.captured
    ) {

      return;

    }


    const position =
      getCanvasPosition(
        event
      );


    trackX.textContent =
      position.x.toFixed(
        2
      );


    trackY.textContent =
      position.y.toFixed(
        2
      );


    if (
      brushCursor.classList.contains(
        'visible'
      )
    ) {

      brushCursor.style.left =
        `${position.screenX}px`;


      brushCursor.style.top =
        `${position.screenY}px`;

    }

  }
);


/* =========================================================
   FIX
========================================================= */

canvas?.addEventListener(
  'click',
  event => {

    if (
      !specimenLab.captured ||
      specimenLab.activeTool !==
        'fix'
    ) {

      return;

    }


    const position =
      getCanvasPosition(
        event
      );


    if (
      !isInsideDetectRegion(
        position.x,
        position.y
      )
    ) {

      labMessage.textContent =
        '선택 영역 밖입니다. / OUTSIDE DETECTED AREA';

      return;

    }


    saveHistory();


    const pin =
      document.createElement(
        'div'
      );


    pin.className =
      'canvas-pin';


    pin.style.left =
      `${position.screenX}px`;


    pin.style.top =
      `${position.screenY}px`;


    pinLayer.appendChild(
      pin
    );


    specimenLab.operations.fix +=
      1;


    updateOperationUI();

  }
);


/* =========================================================
   EXPAND
========================================================= */

canvas?.addEventListener(
  'pointerdown',
  event => {

    if (
      !specimenLab.captured ||
      specimenLab.activeTool !==
        'expand'
    ) {

      return;

    }


    const position =
      getCanvasPosition(
        event
      );


    if (
      !isInsideDetectRegion(
        position.x,
        position.y
      )
    ) {

      labMessage.textContent =
        '선택 영역 밖입니다. / OUTSIDE DETECTED AREA';

      return;

    }


    saveHistory();


    specimenLab.expandDragging =
      true;


    specimenLab.expandStart =
      position;


    canvas.setPointerCapture(
      event.pointerId
    );

  }
);


canvas?.addEventListener(
  'pointermove',
  event => {

    if (
      !specimenLab.expandDragging ||
      specimenLab.activeTool !==
        'expand'
    ) {

      return;

    }


    const current =
      getCanvasPosition(
        event
      );


    applyExpand(
      specimenLab.expandStart,
      current
    );


    specimenLab.expandStart =
      current;

  }
);


canvas?.addEventListener(
  'pointerup',
  () => {

    if (
      !specimenLab.expandDragging
    ) {

      return;

    }


    specimenLab.expandDragging =
      false;


    specimenLab.operations.expand +=
      1;


    updateOperationUI();

  }
);


function applyExpand(
  start,
  current
) {

  const size =
    specimenLab.brushSize;


  const half =
    size / 2;


  const sourceX =
    Math.max(
      0,
      Math.floor(
        start.x -
        half
      )
    );


  const sourceY =
    Math.max(
      0,
      Math.floor(
        start.y -
        half
      )
    );


  const sourceWidth =
    Math.min(
      size,
      canvas.width -
      sourceX
    );


  const sourceHeight =
    Math.min(
      size,
      canvas.height -
      sourceY
    );


  if (
    !doesRectIntersectDetectRegion(
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight
    )
  ) {

    return;

  }


  const temp =
    document.createElement(
      'canvas'
    );


  temp.width =
    sourceWidth;


  temp.height =
    sourceHeight;


  const tempCtx =
    temp.getContext(
      '2d'
    );


  tempCtx.drawImage(

    canvas,

    sourceX,
    sourceY,

    sourceWidth,
    sourceHeight,

    0,
    0,

    sourceWidth,
    sourceHeight

  );


  const dx =
    current.x -
    start.x;


  const dy =
    current.y -
    start.y;


  const horizontal =
    Math.abs(dx) >=
    Math.abs(dy);


  /*
    원본을 임시로 저장.
    이후 Detect mask 밖 부분은 되돌린다.
  */

  const before =
    ctx.getImageData(
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight
    );


  ctx.drawImage(

    temp,

    sourceX +
    dx * 0.22,

    sourceY +
    dy * 0.22,

    horizontal
      ? sourceWidth +
        Math.abs(dx) *
        0.65
      : sourceWidth,

    horizontal
      ? sourceHeight
      : sourceHeight +
        Math.abs(dy) *
        0.65

  );


  /*
    변형된 영역에서 Detect 밖 픽셀은
    작업 이전 상태로 복구
  */

  const after =
    ctx.getImageData(
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight
    );


  for (
    let row = 0;
    row < sourceHeight;
    row += 1
  ) {

    for (
      let column = 0;
      column < sourceWidth;
      column += 1
    ) {

      const canvasX =
        sourceX +
        column;


      const canvasY =
        sourceY +
        row;


      if (
        isInsideDetectRegion(
          canvasX,
          canvasY
        )
      ) {

        continue;

      }


      const index =
        (
          row *
          sourceWidth +
          column
        ) *
        4;


      after.data[index] =
        before.data[index];


      after.data[index + 1] =
        before.data[index + 1];


      after.data[index + 2] =
        before.data[index + 2];


      after.data[index + 3] =
        before.data[index + 3];

    }

  }


  ctx.putImageData(
    after,
    sourceX,
    sourceY
  );

}


/* =========================================================
   PRESERVE
========================================================= */

canvas?.addEventListener(
  'pointerdown',
  event => {

    if (
      !specimenLab.captured ||
      specimenLab.activeTool !==
        'preserve'
    ) {

      return;

    }


    const position =
      getCanvasPosition(
        event
      );


    if (
      !isInsideDetectRegion(
        position.x,
        position.y
      )
    ) {

      labMessage.textContent =
        '선택 영역 밖입니다. / OUTSIDE DETECTED AREA';

      return;

    }


    saveHistory();


    specimenLab.preserveDragging =
      true;


    applyPreserve(
      position
    );

  }
);


canvas?.addEventListener(
  'pointermove',
  event => {

    if (
      !specimenLab.preserveDragging ||
      specimenLab.activeTool !==
        'preserve'
    ) {

      return;

    }


    applyPreserve(
      getCanvasPosition(
        event
      )
    );

  }
);


canvas?.addEventListener(
  'pointerup',
  () => {

    if (
      !specimenLab.preserveDragging
    ) {

      return;

    }


    specimenLab.preserveDragging =
      false;


    specimenLab.operations.preserve +=
      1;


    updateOperationUI();

  }
);


function applyPreserve(
  position
) {

  const size =
    specimenLab.brushSize;


  const x =
    Math.max(
      0,
      Math.floor(
        position.x -
        size / 2
      )
    );


  const y =
    Math.max(
      0,
      Math.floor(
        position.y -
        size / 2
      )
    );


  const width =
    Math.min(
      size,
      canvas.width -
      x
    );


  const height =
    Math.min(
      size,
      canvas.height -
      y
    );


  const image =
    ctx.getImageData(
      x,
      y,
      width,
      height
    );


  const pixels =
    image.data;


  for (
    let row = 0;
    row < height;
    row += 1
  ) {

    for (
      let column = 0;
      column < width;
      column += 1
    ) {

      const canvasX =
        x +
        column;


      const canvasY =
        y +
        row;


      if (
        !isInsideDetectRegion(
          canvasX,
          canvasY
        )
      ) {

        continue;

      }


      const i =
        (
          row *
          width +
          column
        ) *
        4;


      const gray =
        pixels[i];


      const threshold =
        gray >
        128
          ? 238
          : 20;


      const result =
        gray *
        0.5 +
        threshold *
        0.5;


      pixels[i] =
        result;


      pixels[i + 1] =
        result;


      pixels[i + 2] =
        result;

    }

  }


  ctx.putImageData(
    image,
    x,
    y
  );

}


/* =========================================================
   TRAIT
========================================================= */

canvas?.addEventListener(
  'click',
  event => {

    if (
      !specimenLab.captured ||
      specimenLab.activeTool !==
        'trait'
    ) {

      return;

    }


    const position =
      getCanvasPosition(
        event
      );


    if (
      !isInsideDetectRegion(
        position.x,
        position.y
      )
    ) {

      labMessage.textContent =
        '선택 영역 밖입니다. / OUTSIDE DETECTED AREA';

      return;

    }


    saveHistory();


    applyTrait(
      position
    );


    specimenLab.operations.trait +=
      1;


    updateOperationUI();

  }
);


function getRandomTrait() {

  const options =
    traitTypes.filter(
      item =>
        item !==
        specimenLab.lastTrait
    );


  return options[
    Math.floor(
      Math.random() *
      options.length
    )
  ];

}


function applyTrait(
  position
) {

  const size =
    specimenLab.brushSize;


  const x =
    Math.max(
      0,
      Math.floor(
        position.x -
        size / 2
      )
    );


  const y =
    Math.max(
      0,
      Math.floor(
        position.y -
        size / 2
      )
    );


  const width =
    Math.min(
      size,
      canvas.width -
      x
    );


  const height =
    Math.min(
      size,
      canvas.height -
      y
    );


  const trait =
    getRandomTrait();


  specimenLab.lastTrait =
    trait;


  specimenLab.traitHistory.push(
    trait
  );


  if (
    trait ===
    'GRAIN'
  ) {

    traitGrain(
      x,
      y,
      width,
      height
    );

  }


  else if (
    trait ===
    'PATTERN LOSS'
  ) {

    traitLoss(
      x,
      y,
      width,
      height
    );

  }


  else if (
    trait ===
    'DENSITY'
  ) {

    traitDensity(
      x,
      y,
      width,
      height
    );

  }


  else if (
    trait ===
    'STRIPE'
  ) {

    traitStripe(
      x,
      y,
      width,
      height
    );

  }


  else if (
    trait ===
    'CELL'
  ) {

    traitCell(
      x,
      y,
      width,
      height
    );

  }


  else {

    traitDisplacement(
      x,
      y,
      width,
      height
    );

  }


  updateTraitUI();


  labMessage.textContent =
    `특이형질 생성 / TRAIT GENERATED: ${bilingualTrait(trait)}`;

}


/* =========================================================
   TRAIT EFFECT HELPER
========================================================= */

function applyTraitPixels(
  x,
  y,
  width,
  height,
  callback
) {

  const image =
    ctx.getImageData(
      x,
      y,
      width,
      height
    );


  for (
    let row = 0;
    row < height;
    row += 1
  ) {

    for (
      let column = 0;
      column < width;
      column += 1
    ) {

      const canvasX =
        x +
        column;


      const canvasY =
        y +
        row;


      if (
        !isInsideDetectRegion(
          canvasX,
          canvasY
        )
      ) {

        continue;

      }


      const index =
        (
          row *
          width +
          column
        ) *
        4;


      callback(
        image.data,
        index,
        row,
        column
      );

    }

  }


  ctx.putImageData(
    image,
    x,
    y
  );

}


/* =========================================================
   GRAIN
========================================================= */

function traitGrain(
  x,
  y,
  width,
  height
) {

  applyTraitPixels(
    x,
    y,
    width,
    height,
    (
      pixels,
      index
    ) => {

      const noise =
        (
          Math.random() -
          0.5
        ) *
        120;


      const value =
        Math.max(
          0,
          Math.min(
            255,
            pixels[index] +
            noise
          )
        );


      pixels[index] =
        value;


      pixels[index + 1] =
        value;


      pixels[index + 2] =
        value;

    }
  );

}


/* =========================================================
   LOSS
========================================================= */

function traitLoss(
  x,
  y,
  width,
  height
) {

  applyTraitPixels(
    x,
    y,
    width,
    height,
    (
      pixels,
      index
    ) => {

      if (
        Math.random() <
        0.18
      ) {

        pixels[index] =
          245;


        pixels[index + 1] =
          245;


        pixels[index + 2] =
          245;

      }

    }
  );

}


/* =========================================================
   DENSITY
========================================================= */

function traitDensity(
  x,
  y,
  width,
  height
) {

  applyTraitPixels(
    x,
    y,
    width,
    height,
    (
      pixels,
      index
    ) => {

      const value =
        pixels[index] *
        0.55;


      pixels[index] =
        value;


      pixels[index + 1] =
        value;


      pixels[index + 2] =
        value;

    }
  );

}


/* =========================================================
   STRIPE
========================================================= */

function traitStripe(
  x,
  y,
  width,
  height
) {

  applyTraitPixels(
    x,
    y,
    width,
    height,
    (
      pixels,
      index,
      row
    ) => {

      if (
        row %
        12 <
        4
      ) {

        pixels[index] *=
          0.35;


        pixels[index + 1] =
          pixels[index];


        pixels[index + 2] =
          pixels[index];

      }

    }
  );

}


/* =========================================================
   CELL
========================================================= */

function traitCell(
  x,
  y,
  width,
  height
) {

  const original =
    ctx.getImageData(
      x,
      y,
      width,
      height
    );


  const block =
    14;


  for (
    let row = 0;
    row < height;
    row += block
  ) {

    for (
      let column = 0;
      column < width;
      column += block
    ) {

      const canvasX =
        x +
        column;


      const canvasY =
        y +
        row;


      if (
        !isInsideDetectRegion(
          canvasX,
          canvasY
        )
      ) {

        continue;

      }


      const sampleIndex =
        (
          Math.min(
            row,
            height -
            1
          ) *
          width +
          Math.min(
            column,
            width -
            1
          )
        ) *
        4;


      const gray =
        original.data[
          sampleIndex
        ];


      ctx.fillStyle =
        `rgb(${gray}, ${gray}, ${gray})`;


      /*
        블록 내부에서도 선택 영역 밖에는
        덮어쓰지 않도록 픽셀 단위 검사
      */

      for (
        let blockY = 0;
        blockY < block;
        blockY += 1
      ) {

        for (
          let blockX = 0;
          blockX < block;
          blockX += 1
        ) {

          const px =
            canvasX +
            blockX;


          const py =
            canvasY +
            blockY;


          if (
            px >=
              x +
              width ||
            py >=
              y +
              height
          ) {

            continue;

          }


          if (
            !isInsideDetectRegion(
              px,
              py
            )
          ) {

            continue;

          }


          ctx.fillRect(
            px,
            py,
            1,
            1
          );

        }

      }

    }

  }

}


/* =========================================================
   DISPLACEMENT
========================================================= */

function traitDisplacement(
  x,
  y,
  width,
  height
) {

  const before =
    ctx.getImageData(
      x,
      y,
      width,
      height
    );


  const temp =
    document.createElement(
      'canvas'
    );


  temp.width =
    width;


  temp.height =
    height;


  const tempCtx =
    temp.getContext(
      '2d'
    );


  tempCtx.putImageData(
    before,
    0,
    0
  );


  const slice =
    12;


  for (
    let row = 0;
    row < height;
    row += slice
  ) {

    const offset =
      (
        Math.random() -
        0.5
      ) *
      28;


    ctx.drawImage(

      temp,

      0,
      row,
      width,
      slice,

      x +
      offset,

      y +
      row,

      width,
      slice

    );

  }


  /*
    Detect 영역 밖 원상 복구
  */

  const after =
    ctx.getImageData(
      x,
      y,
      width,
      height
    );


  for (
    let row = 0;
    row < height;
    row += 1
  ) {

    for (
      let column = 0;
      column < width;
      column += 1
    ) {

      const px =
        x +
        column;


      const py =
        y +
        row;


      if (
        isInsideDetectRegion(
          px,
          py
        )
      ) {

        continue;

      }


      const index =
        (
          row *
          width +
          column
        ) *
        4;


      after.data[index] =
        before.data[index];


      after.data[index + 1] =
        before.data[index + 1];


      after.data[index + 2] =
        before.data[index + 2];


      after.data[index + 3] =
        before.data[index + 3];

    }

  }


  ctx.putImageData(
    after,
    x,
    y
  );

}


/* =========================================================
   UI
========================================================= */

function updateTraitUI() {

  lastTraitText.textContent =
    bilingualTrait(specimenLab.lastTrait);

}


function resetOperations() {

  specimenLab.operations = {

    fix: 0,

    expand: 0,

    preserve: 0,

    trait: 0

  };


  updateOperationUI();

}


function updateOperationUI() {

  fixOperationCount.textContent =
    String(
      specimenLab.operations.fix
    ).padStart(
      2,
      '0'
    );


  expandOperationCount.textContent =
    String(
      specimenLab.operations.expand
    ).padStart(
      2,
      '0'
    );


  preserveOperationCount.textContent =
    String(
      specimenLab.operations.preserve
    ).padStart(
      2,
      '0'
    );


  traitOperationCount.textContent =
    String(
      specimenLab.operations.trait
    ).padStart(
      2,
      '0'
    );

}


/* =========================================================
   RECAPTURE
========================================================= */

async function recaptureSpecimen() {

  printButton.disabled = true;

  specimenLab.inputSource = null;
  recaptureButton.textContent = '다시 촬영 / RECAPTURE';

  specimenLab.captured =
    false;


  specimenLab.history =
    [];


  specimenLab.detectRegions =
    [];


  specimenLab.traitHistory =
    [];


  specimenLab.lastTrait =
    null;


  resetOperations();


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  canvas.classList.remove(
    'is-active'
  );


  detectLayer.innerHTML =
    '';


  pinLayer.innerHTML =
    '';


  captureArea.classList.remove(
    'is-captured'
  );


  disableTools();


  selectTool(
    'capture'
  );


  undoButton.disabled =
    true;


  recaptureButton.disabled =
    true;


  registerButton.disabled =
    true;


  updateTraitUI();


  updateDetectCount();


  if (
    specimenLab.stream
  ) {

    camera.classList.add(
      'is-active'
    );


    captureButton.disabled =
      false;


    captureStatus.textContent =
      'LIVE INPUT';


    systemStatus.textContent =
      'CAMERA READY';


    specimenStateText.textContent =
      '실시간 / LIVE';


    canvasMode.textContent =
      'LIVE INPUT';


    labMessage.textContent =
      '새 표본을 배치하고 다시 촬영하세요. / Place a new specimen and capture again.';

  }

  else {

    await enableSpecimenCamera();

  }

}


recaptureButton?.addEventListener(
  'click',
  () => {
    if (specimenLab.inputSource === 'upload') chooseSpecimenImage();
    else recaptureSpecimen();
  }
);


/* =========================================================
   REGISTER
========================================================= */

function createSpecimenNumber() {

  const current =
    Number(
      localStorage.getItem(
        'specimenHumanCounter'
      ) ||
      '0'
    );


  const next =
    current +
    1;


  localStorage.setItem(
    'specimenHumanCounter',
    String(next)
  );


  return (
    'SP-H-' +
    String(next)
      .padStart(
        4,
        '0'
      )
  );

}


registerButton?.addEventListener(
  'click',
  () => {

    if (
      !specimenLab.captured
    ) {

      return;

    }


    const specimenNumber =
      createSpecimenNumber();


    const archiveSpecimen = {

      id:
        specimenNumber,

      type:
        'human',

      image:
        canvas.toDataURL(
          'image/png'
        ),

      createdAt:
        new Date()
          .toISOString(),

      detectedRegions:
        specimenLab.detectRegions.map(
          region => ({
            ...region
          })
        ),

      operations: {
        ...specimenLab.operations
      },

      traits: [
        ...specimenLab.traitHistory
      ]

    };


    let archive =
      [];


    try {

      archive =
        JSON.parse(
          localStorage.getItem(
            'specimenArchive'
          ) ||
          '[]'
        );

    }

    catch {

      archive =
        [];

    }


    archive.push(
      archiveSpecimen
    );


    archive =
      archive.slice(
        -25
      );


    try {

      localStorage.setItem(
        'specimenArchive',
        JSON.stringify(
          archive
        )
      );

    }

    catch (error) {

      console.error(
        error
      );


      labMessage.textContent =
        '아카이브 저장 공간이 가득 찼습니다. / ARCHIVE STORAGE FULL';


      return;

    }


    specimenLab.archiveId = specimenNumber;

    specimenStateText.textContent =
      specimenNumber;


    canvasMode.textContent =
      specimenNumber;


    captureStatus.textContent =
      'REGISTERED';


    systemStatus.textContent =
      'SPECIMEN REGISTERED';


    registerButton.disabled =
      true;


    labMessage.textContent =
      `${specimenNumber} 등록 완료 / REGISTERED — 표본 아카이브 → 인간 / SPECIMEN ARCHIVE → HUMAN`;

  }
);


function ensureCurrentSpecimenArchived() {
  if (!specimenLab.captured) return null;

  if (!specimenLab.archiveId) {
    registerButton?.click();
  }
  const id = specimenLab.archiveId;
  if (!id) return null;

  try {
    const archive = JSON.parse(localStorage.getItem('specimenArchive') || '[]');
    const index = archive.findIndex(item => item.id === id);
    if (index < 0) return null;

    archive[index] = {
      ...archive[index],
      image: canvas.toDataURL('image/png'),
      createdAt: archive[index].createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      detectedRegions: specimenLab.detectRegions.map(region => ({ ...region })),
      operations: { ...specimenLab.operations },
      traits: [...specimenLab.traitHistory]
    };
    localStorage.setItem('specimenArchive', JSON.stringify(archive));
    return id;
  } catch (error) {
    console.error('Archive save failed:', error);
    labMessage.textContent = '표본을 저장하지 못했습니다. 저장 공간을 확인하세요. / Could not save specimen. Check available storage.';
    return null;
  }
}


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
  'resize',
  () => {

    updateBrushCursorSize();


    if (
      specimenLab.captured
    ) {

      renderDetectRegions();

    }

  }
);


/* =========================================================
   INIT
========================================================= */

function initializeLab() {

  disableTools();


  selectTool(
    'capture'
  );


  captureButton.disabled =
    true;


  undoButton.disabled =
    true;


  recaptureButton.disabled =
    true;


  registerButton.disabled =
    true;


  updateTraitUI();


  updateDetectCount();


  updateOperationUI();

}


initializeLab();


/* =========================================================
   CLEANUP
========================================================= */

window.addEventListener(
  'beforeunload',
  () => {

    specimenLab.stream
      ?.getTracks()
      .forEach(
        track =>
          track.stop()
      );

  }
);

// Reserve the actual instruction height, including wrapped bilingual messages.
const guidancePanel = lab$('.workspace .system-message');
const guidanceWorkspace = lab$('.workspace');
if (guidancePanel && guidanceWorkspace) {
  const updateGuidanceSpace = () => {
    guidanceWorkspace.style.setProperty(
      '--workspace-top', `${Math.ceil(guidancePanel.getBoundingClientRect().height) + 40}px`
    );
  };
  const guidanceObserver = new ResizeObserver(updateGuidanceSpace);
  guidanceObserver.observe(guidancePanel);
  updateGuidanceSpace();
}


printButton?.addEventListener('click', () => {
  if (!specimenLab.captured || specimenLab.inputBusy) return;
  const specimenNumber = ensureCurrentSpecimenArchived();
  if (!specimenNumber) return;
  try {
    const opened = openSpecimenReceipt({
      image: canvas.toDataURL('image/png'),
      number: specimenNumber,
      source: specimenLab.inputSource,
      operations: { ...specimenLab.operations },
      detected: specimenLab.detectRegions.length,
      trait: bilingualTrait(specimenLab.lastTrait)
    });
    labMessage.textContent = opened
      ? '출력 창에서 인쇄 버튼을 누르고 BIXOLON 프린터를 선택하세요. / Select the BIXOLON printer in the print window.'
      : '출력 창이 차단되었습니다. 이 사이트의 팝업을 허용하고 다시 시도하세요. / Allow pop-ups and try again.';
  } catch (error) {
    console.error(error);
    labMessage.textContent = '출력 미리보기를 준비하지 못했습니다. 다시 시도하세요. / Could not prepare print preview. Try again.';
  }
});


window.addEventListener('message', event => {
  if (event.origin !== window.location.origin) return;
  if (event.data?.type !== 'specimen-printed' || !event.data.id) return;
  window.location.assign(`archive.html?new=${encodeURIComponent(event.data.id)}`);
});
