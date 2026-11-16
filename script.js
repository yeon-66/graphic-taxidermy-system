/* =========================================================
   GENERAL WEBSITE SCRIPT
   script.js

   PAGES
   - HOME
   - SPECIMEN INDEX
   - PROCESS
   - MORPHOLOGICAL TRAITS
   - COMBINATION LAB
   - SPECIMEN ARCHIVE
   - WHAT WE PRESERVE

   SPECIMEN LAB uses:
   specimen-lab.js
========================================================= */


/* =========================================================
   HELPERS
========================================================= */

const $ = (
  selector,
  root = document
) => root.querySelector(selector);


const $$ = (
  selector,
  root = document
) => [
  ...root.querySelectorAll(selector)
];



/* =========================================================
   GLOBAL MENU
========================================================= */

const menuButton =
  $('.menu-button');

const globalMenu =
  $('.global-menu');

const menuClose =
  $('.menu-close');


function openMenu() {

  if (!globalMenu) {
    return;
  }


  globalMenu.classList.add(
    'is-open'
  );


  globalMenu.setAttribute(
    'aria-hidden',
    'false'
  );


  document.body.classList.add(
    'menu-open'
  );

}


function closeMenu() {

  if (!globalMenu) {
    return;
  }


  globalMenu.classList.remove(
    'is-open'
  );


  globalMenu.setAttribute(
    'aria-hidden',
    'true'
  );


  document.body.classList.remove(
    'menu-open'
  );

}


menuButton?.addEventListener(
  'click',
  openMenu
);


menuClose?.addEventListener(
  'click',
  closeMenu
);


document.addEventListener(
  'keydown',
  event => {

    if (
      event.key === 'Escape' &&
      globalMenu?.classList.contains(
        'is-open'
      )
    ) {

      closeMenu();

    }

  }
);



/* =========================================================
   GLOBAL CUSTOM CURSOR
========================================================= */

const globalCursor =
  $('.glass-neon-cursor');


const hasFinePointer =
  window.matchMedia(
    '(pointer: fine)'
  ).matches;


if (
  globalCursor &&
  hasFinePointer
) {

  document.addEventListener(
    'mousemove',
    event => {

      globalCursor.style.left =
        `${event.clientX}px`;


      globalCursor.style.top =
        `${event.clientY}px`;

    }
  );


  document.addEventListener(
    'mousedown',
    () => {

      globalCursor.classList.add(
        'active'
      );

    }
  );


  document.addEventListener(
    'mouseup',
    () => {

      globalCursor.classList.remove(
        'active'
      );

    }
  );


  /*
    이벤트 위임 방식.

    나중에 JS로 생성되는 HUMAN 카드의
    DELETE 버튼에도 자동 적용된다.
  */

  document.addEventListener(
    'mouseover',
    event => {

      const target =
        event.target.closest(
          `
          a,
          button,
          input,
          .interactive-card
          `
        );


      if (!target) {
        return;
      }


      globalCursor.classList.add(
        'hover'
      );

    }
  );


  document.addEventListener(
    'mouseout',
    event => {

      const target =
        event.target.closest(
          `
          a,
          button,
          input,
          .interactive-card
          `
        );


      if (!target) {
        return;
      }


      const related =
        event.relatedTarget;


      if (
        related &&
        target.contains(
          related
        )
      ) {

        return;

      }


      globalCursor.classList.remove(
        'hover'
      );

    }
  );

}



/* =========================================================
   PROCESS PAGE
========================================================= */

const processButtons =
  $$('.process-button');

const processName =
  $('#processName');

const processNumber =
  $('#processNumber');

const processDescription =
  $('#processDescription');

const processVisual =
  $('.workstation-canvas');


const processData = {
  fix: { name: 'FIX / 고정', number: '01 / 04', description: '형태의 기준점을 지정하고 원본 이미지의 구조를 고정합니다.' },
  expand: { name: 'EXPAND / 전개', number: '02 / 04', description: '도형화, 구조 분할, 골격과 질감 추출을 통해 이미지의 형태를 전개합니다.' },
  preserve: { name: 'PRESERVE / 보존', number: '03 / 04', description: '압착, 반복, 표면 변환과 색의 소실을 통해 이미지를 보존 가능한 형태로 변환합니다.' },
  trait: { name: 'TRAIT / 특이형질', number: '04 / 04', description: '비대칭, 패턴 변화와 형태적 변이를 별도의 형질로 기록합니다.' }
};


processButtons.forEach(
  button => {

    button.addEventListener(
      'click',
      () => {

        const key =
          button.dataset.process;


        const data =
          processData[key];


        if (!data) {
          return;
        }


        processButtons.forEach(
          item => {

            item.classList.remove(
              'active'
            );

          }
        );


        button.classList.add(
          'active'
        );


        if (processName) {

          processName.textContent =
            data.name;

        }


        if (processNumber) {

          processNumber.textContent =
            data.number;

        }


        if (processDescription) {

          processDescription.textContent =
            data.description;

        }


        if (processVisual) {

          processVisual.dataset
            .processVisual =
            key;

        }

      }
    );

  }
);



/* =========================================================
   COMBINATION GALLERY
========================================================= */

const gallery =
  $('#horizontalGallery') || $('#homeProcessTrack');

const galleryProgress =
  $('#galleryProgress') || $('#homeStepProgress');


if (gallery) {

  let dragging =
    false;

  let startX =
    0;

  let startScrollLeft =
    0;


  /*
    카드가 화면 중앙에서 얼마나 떨어져 있는지에 따라

    rotateY
    translateZ
    scale

    값을 변화시킨다.
  */

  function updateGallery() {

    const cards =
      $$('.gallery-card', gallery);


    if (
      cards.length === 0
    ) {

      return;

    }


    const galleryRect =
      gallery.getBoundingClientRect();


    const center =
      galleryRect.left +
      galleryRect.width /
      2;


    let nearestIndex =
      0;


    let nearestDistance =
      Infinity;


    cards.forEach(
      (card, index) => {

        const rect =
          card.getBoundingClientRect();


        const cardCenter =
          rect.left +
          rect.width /
          2;


        const distance =
          cardCenter -
          center;


        const normalized =
          Math.max(
            -1,
            Math.min(
              1,
              distance /
              galleryRect.width
            )
          );


        const rotateY =
          normalized *
          -18;


        const translateZ =
          Math.abs(
            normalized
          ) *
          -90;


        const scale =
          1 -
          Math.abs(
            normalized
          ) *
          0.08;


        card.style.transform =
          `
            perspective(1300px)
            rotateY(${rotateY}deg)
            translateZ(${translateZ}px)
            scale(${scale})
          `;


        if (
          Math.abs(
            distance
          ) <
          nearestDistance
        ) {

          nearestDistance =
            Math.abs(
              distance
            );


          nearestIndex =
            index;

        }

      }
    );


    if (galleryProgress) {

      galleryProgress.textContent =
        `${
          String(
            nearestIndex + 1
          ).padStart(
            2,
            '0'
          )
        } / ${
          String(
            cards.length
          ).padStart(
            2,
            '0'
          )
        }`;

    }

  }


  /*
    실제 horizontal scroll
  */

  gallery.addEventListener(
    'scroll',
    updateGallery,
    {
      passive: true
    }
  );


  /*
    마우스 세로 휠을
    가로 이동으로 변환
  */

  gallery.addEventListener(
    'wheel',
    event => {

      if (
        Math.abs(
          event.deltaY
        ) <=
        Math.abs(
          event.deltaX
        )
      ) {

        return;

      }


      event.preventDefault();


      gallery.scrollLeft +=
        event.deltaY;

    },
    {
      passive: false
    }
  );


  /*
    Pointer drag
  */

  gallery.addEventListener(
    'pointerdown',
    event => {

      dragging =
        true;


      startX =
        event.clientX;


      startScrollLeft =
        gallery.scrollLeft;


      gallery.setPointerCapture(
        event.pointerId
      );

    }
  );


  gallery.addEventListener(
    'pointermove',
    event => {

      if (!dragging) {
        return;
      }


      gallery.scrollLeft =
        startScrollLeft -
        (
          event.clientX -
          startX
        );

    }
  );


  function stopGalleryDrag(
    event
  ) {

    dragging =
      false;


    if (
      event?.pointerId !== undefined &&
      gallery.hasPointerCapture(
        event.pointerId
      )
    ) {

      gallery.releasePointerCapture(
        event.pointerId
      );

    }

  }


  gallery.addEventListener(
    'pointerup',
    stopGalleryDrag
  );


  gallery.addEventListener(
    'pointercancel',
    stopGalleryDrag
  );


  window.addEventListener(
    'resize',
    updateGallery
  );


  requestAnimationFrame(
    updateGallery
  );

}



/* =========================================================
   SPECIMEN ARCHIVE
========================================================= */

const archiveGrid =
  $('#archiveGrid');

const archiveFilters =
  $$('.archive-filter');

const archiveSearch =
  $('#archiveSearch');

const archiveCount =
  $('#archiveCount');


let currentArchiveFilter =
  'all';



/* =========================================================
   ARCHIVE STORAGE
========================================================= */

function getSavedHumanSpecimens() {

  try {

    const data =
      JSON.parse(
        localStorage.getItem(
          'specimenArchive'
        ) ||
        '[]'
      );


    if (
      !Array.isArray(data)
    ) {

      return [];

    }


    return data;

  }

  catch (error) {

    console.error(
      'Archive load failed:',
      error
    );


    return [];

  }

}



/* =========================================================
   LOAD HUMAN SPECIMENS
========================================================= */

function loadUserSpecimens() {

  if (!archiveGrid) {
    return;
  }


  const specimens =
    getSavedHumanSpecimens();


  /*
    가장 최근 등록된 표본이
    앞쪽에 보이도록 reverse.
  */

  [...specimens]
    .reverse()
    .forEach(
      specimen => {

        if (
          !specimen ||
          !specimen.id ||
          !specimen.image
        ) {

          return;

        }


        const article =
          document.createElement(
            'article'
          );


        article.className =
          'archive-item interactive-card human-archive-item';


        article.dataset.type =
          'human';


        article.dataset.id =
          specimen.id;


        /*
          HUMAN 카드에만 DELETE 버튼을 넣는다.

          기존 INSECT / GRAPHIC 항목에는
          DELETE 버튼이 존재하지 않는다.
        */

        article.innerHTML =
          `
            <div class="archive-image">

              <img
                src="${specimen.image}"
                alt="${specimen.id}"
              >

            </div>


            <div class="archive-item-meta">

              <span>
                ${specimen.id}
              </span>

              <span>
                HUMAN
              </span>

            </div>


            <button
              type="button"
              class="delete-human-specimen"
              data-specimen-id="${specimen.id}"
              aria-label="${specimen.id} 삭제"
            >
              DELETE ×
            </button>
          `;


        archiveGrid.prepend(article);

        const newSpecimenId = new URLSearchParams(window.location.search).get('new');
        if (specimen.id === newSpecimenId) {
          article.classList.add('is-new-specimen');
          window.setTimeout(() => article.scrollIntoView({ behavior: 'smooth', block: 'center' }), 180);
        }

      }
    );

}



/* =========================================================
   GET CURRENT ARCHIVE ITEMS
========================================================= */

function getArchiveItems() {

  return $$('.archive-item');

}



/* =========================================================
   ARCHIVE FILTER
========================================================= */

function applyArchiveFilter() {

  const archiveItems =
    getArchiveItems();


  const searchValue =
    archiveSearch
      ?.value
      .trim()
      .toUpperCase()
    ??
    '';


  let visibleCount =
    0;


  archiveItems.forEach(
    item => {

      const type =
        item.dataset.type
          ?.toLowerCase()
        ??
        '';


      const id =
        item.dataset.id
          ?.toUpperCase()
        ??
        '';


      const matchesType =
        currentArchiveFilter ===
          'all' ||
        type ===
          currentArchiveFilter;


      const matchesSearch =
        searchValue ===
          '' ||
        id.includes(
          searchValue
        );


      const visible =
        matchesType &&
        matchesSearch;


      item.classList.toggle(
        'is-hidden',
        !visible
      );


      if (visible) {

        visibleCount +=
          1;

      }

    }
  );


  if (archiveCount) {
    archiveCount.textContent = String(visibleCount).padStart(4, '0');
  }

  const archiveEmpty = $('#archiveEmpty');
  if (archiveEmpty) {
    archiveEmpty.hidden = archiveItems.length > 0 && visibleCount > 0;
    if (archiveItems.length > 0 && visibleCount === 0) {
      archiveEmpty.innerHTML = '검색 조건에 맞는 표본이 없습니다.<br><small>NO SPECIMENS MATCH YOUR SEARCH.</small>';
    }
  }

}



/* =========================================================
   ARCHIVE FILTER BUTTONS
========================================================= */

archiveFilters.forEach(
  button => {

    button.addEventListener(
      'click',
      () => {

        currentArchiveFilter =
          button.dataset.filter
            ?.toLowerCase()
          ??
          'all';


        archiveFilters.forEach(
          item => {

            item.classList.remove(
              'active'
            );

          }
        );


        button.classList.add(
          'active'
        );


        applyArchiveFilter();

      }
    );

  }
);



/* =========================================================
   ARCHIVE SEARCH
========================================================= */

archiveSearch?.addEventListener(
  'input',
  applyArchiveFilter
);



/* =========================================================
   DELETE HUMAN SPECIMEN
========================================================= */

function deleteHumanSpecimen(
  specimenId
) {

  /*
    localStorage에서 현재 HUMAN archive를 읽는다.
  */

  const archive =
    getSavedHumanSpecimens();


  /*
    삭제 대상 ID만 제외한다.
  */

  const updatedArchive =
    archive.filter(
      specimen =>
        specimen.id !==
        specimenId
    );


  try {

    /*
      실제 저장 데이터 갱신
    */

    localStorage.setItem(
      'specimenArchive',
      JSON.stringify(
        updatedArchive
      )
    );

  }

  catch (error) {

    console.error(
      'Archive delete failed:',
      error
    );


    window.alert(
      '표본을 삭제할 수 없습니다.'
    );


    return;

  }


  /*
    화면 카드 제거
  */

  const card =
    archiveGrid
      ?.querySelector(
        `.archive-item[data-id="${CSS.escape(specimenId)}"]`
      );


  card?.remove();


  /*
    필터 / 카운트 재계산
  */

  applyArchiveFilter();

}



/* =========================================================
   HUMAN DELETE EVENT
========================================================= */

archiveGrid?.addEventListener(
  'click',
  event => {

    const deleteButton =
      event.target.closest(
        '.delete-human-specimen'
      );


    if (!deleteButton) {
      return;
    }


    /*
      카드 자체의 클릭 인터랙션이 있다면
      DELETE 클릭이 전파되지 않게 한다.
    */

    event.preventDefault();

    event.stopPropagation();


    const specimenId =
      deleteButton.dataset
        .specimenId;


    if (!specimenId) {
      return;
    }


    /*
      브라우저 기본 confirm.
      나중에 디자인된 삭제 Modal로 교체 가능.
    */

    const confirmed =
      window.confirm(
        `${specimenId} 표본을 아카이브에서 삭제할까요?\n\n삭제한 표본은 복구할 수 없습니다.`
      );


    if (!confirmed) {
      return;
    }


    deleteHumanSpecimen(
      specimenId
    );

  }
);



/* =========================================================
   ARCHIVE INITIALIZATION
========================================================= */

if (archiveGrid) {

  /*
    1.
    Specimen Lab에서 등록된 HUMAN 표본을
    먼저 불러온다.
  */

  loadUserSpecimens();


  /*
    2.
    HUMAN까지 포함한 전체 archive에
    현재 필터를 적용한다.
  */

  applyArchiveFilter();

}



/* =========================================================
   END
========================================================= */

// Load Overview slide art from the editable data-image-src paths in index.html.
$$('.overview-gallery-card [data-image-src]').forEach(visual => {
  const path = visual.dataset.imageSrc.trim();
  if (!path) return;
  const image = document.createElement('img');
  image.src = path;
  image.alt = visual.getAttribute('aria-label') || '';
  image.loading = 'lazy';
  image.addEventListener('load', () => {
    visual.replaceChildren(image);
    visual.classList.add('has-image');
  });
  image.addEventListener('error', () => {
    console.warn(`Overview image not found: ${path}`);
  });
});

// Independent drag and vertical-wheel scrolling for each collection row.
$$('.collection-track').forEach(track => {
  track.addEventListener('wheel', event => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      track.scrollLeft += event.deltaY;
    }
  }, { passive: false });

  let dragging = false;
  let startX = 0;
  let initialScroll = 0;
  track.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    dragging = true;
    startX = event.clientX;
    initialScroll = track.scrollLeft;
    track.setPointerCapture(event.pointerId);
  });
  track.addEventListener('pointermove', event => {
    if (!dragging) return;
    track.scrollLeft = initialScroll - (event.clientX - startX);
  });
  const stopDragging = () => { dragging = false; };
  track.addEventListener('pointerup', stopDragging);
  track.addEventListener('pointercancel', stopDragging);
});

$$('.collection-image-card img').forEach(image => {
  image.addEventListener('error', () => {
    const fallback = image.dataset.fallback;
    if (fallback && !image.dataset.fallbackTried) {
      image.dataset.fallbackTried = 'true';
      image.src = fallback;
      return;
    }
    image.hidden = true;
  });
});

const collectionLightbox = $('#collectionLightbox');
const collectionLightboxImage = collectionLightbox?.querySelector('img');
const collectionLightboxClose = collectionLightbox?.querySelector('.collection-lightbox-close');

function closeCollectionLightbox() {
  if (!collectionLightbox) return;
  collectionLightbox.classList.remove('is-open');
  collectionLightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('collection-lightbox-open');
  collectionLightboxImage?.removeAttribute('src');
}

function openCollectionLightbox(card) {
  const image = card.querySelector('.collection-image-area img');
  if (!image || image.hidden || (image.complete && image.naturalWidth === 0)) return;
  collectionLightboxImage.src = image.currentSrc || image.src;
  collectionLightboxImage.alt = image.alt;
  collectionLightbox.classList.add('is-open');
  collectionLightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('collection-lightbox-open');
  collectionLightboxClose?.focus();
}

$$('.collection-track').forEach(track => {
  track.addEventListener('click', event => {
    if (track.dataset.dragged === 'true') return;
    const card = event.target.closest('.collection-image-card');
    if (card) openCollectionLightbox(card);
  });
  track.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.collection-image-card')) {
      event.preventDefault();
      openCollectionLightbox(event.target);
    }
  });
  track.addEventListener('pointerdown', () => { track.dataset.dragged = 'false'; });
  track.addEventListener('pointermove', event => {
    if (event.buttons && Math.abs(event.movementX) > 3) track.dataset.dragged = 'true';
  });
  track.addEventListener('pointerup', () => {
    if (track.dataset.dragged === 'true') setTimeout(() => { track.dataset.dragged = 'false'; }, 120);
  });
});

collectionLightboxClose?.addEventListener('click', closeCollectionLightbox);
collectionLightbox?.addEventListener('click', event => {
  if (event.target === collectionLightbox) closeCollectionLightbox();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && collectionLightbox?.classList.contains('is-open')) closeCollectionLightbox();
});
