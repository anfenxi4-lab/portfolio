let works = [];
let currentFilter = 'all';
let currentWork = null;
let currentMediaIndex = 0;

const grid = document.getElementById('works-grid');
const modal = document.getElementById('modal');
const modalMedia = document.getElementById('modal-media');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalDownload = document.getElementById('modal-download');
const counter = document.getElementById('media-counter');

document.addEventListener('DOMContentLoaded', () => {
  fetch('works.json')
    .then(res => res.json())
    .then(data => {
      works = data || [];
      renderGrid();
    });

  // 筛选按钮
  document.getElementById('filter-bar').addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      renderGrid();
    }
  });

  // 关闭弹窗
  document.querySelector('.close').addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

  document.getElementById('prev-media').addEventListener('click', () => changeMedia(-1));
  document.getElementById('next-media').addEventListener('click', () => changeMedia(1));
});

function renderGrid() {
  const filtered = currentFilter === 'all' ? works : works.filter(w => w.category === currentFilter);
  grid.innerHTML = filtered.map((work, idx) => {
    const img = work.thumbnail || (work.images && work.images.length ? work.images[0] : '');
    const catMap = { character: '3D 角色', scene: '3D 场景', video: '视频展示', download: '可下载' };
    return `
      <div class="work-card" data-index="${works.indexOf(work)}">
        ${img ? `< img class="card-img" src="${img}" alt="${work.title}">` : ''}
        <div class="card-body">
          <h3>${work.title}</h3>
          <p class="card-desc">${work.description || ''}</p >
          <span class="card-tag">${catMap[work.category] || work.category}</span>
        </div>
      </div>`;
  }).join('');

  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', () => {
      const index = parseInt(card.dataset.index);
      openDetail(works[index]);
    });
  });
}

function openDetail(work) {
  currentWork = work;
  currentMediaIndex = 0;
  renderMedia();
  modalTitle.textContent = work.title;
  modalDesc.textContent = work.description || '';
  modalDownload.innerHTML = work.download_file
    ? `<a href=" " target="_blank">⬇ 下载文件</a >`
    : '';
  modal.style.display = 'flex';
}

function renderMedia() {
  if (!currentWork) return;
  const images = currentWork.images || [];
  const videoUrl = currentWork.video_url;

  // 先考虑视频
  if (videoUrl && currentMediaIndex === 0 && videoUrl.trim() !== '') {
    modalMedia.innerHTML = `<video controls src="${videoUrl}"></video>`;
  } else {
    // 如果是视频作品但没有图片，只展示视频
    const adjustedIndex = videoUrl ? currentMediaIndex - 1 : currentMediaIndex;
    if (images.length > 0 && adjustedIndex >= 0 && adjustedIndex < images.length) {
      modalMedia.innerHTML = `< img src="${images[adjustedIndex]}" alt="">`;
    } else if (!videoUrl) {
      // 没有任何媒体
      modalMedia.innerHTML = `<p style="color:#777;">暂无媒体</p >`;
    } else {
      // 只有视频，但 index 不对
      modalMedia.innerHTML = `<video controls src="${videoUrl}"></video>`;
    }
  }

  updateCounter();
}

function changeMedia(dir) {
  if (!currentWork) return;
  const images = currentWork.images || [];
  const videoUrl = currentWork.video_url;
  let total = (videoUrl ? 1 : 0) + images.length;
  if (total === 0) return;

  currentMediaIndex += dir;
  if (currentMediaIndex < 0) currentMediaIndex = total - 1;
  if (currentMediaIndex >= total) currentMediaIndex = 0;

  renderMedia();
}

function updateCounter() {
  if (!currentWork) return;
  const images = currentWork.images || [];
  const videoUrl = currentWork.video_url;
  let total = (videoUrl ? 1 : 0) + images.length;
  counter.textContent = total ? `${currentMediaIndex + 1} / ${total}` : '';
}