function toast(msg, type = 'info', duration = 3000) {
  const icons = {
    success: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `${icons[type] || ''}<span>${msg}</span>`;

  document.getElementById('toastContainer').appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s';

    setTimeout(() => el.remove(), 300);
  }, duration);
}

function renderSkeletonRec(n = 5) {
  const area = document.getElementById('recArea');

  area.innerHTML = Array.from({ length: n }, () => `
    <div style="padding:10px 16px;border-bottom:1px solid var(--border);">
      <div class="skeleton skel-name" style="width:70%"></div>
      <div class="skeleton skel-bar"></div>
    </div>
  `).join('');
}

/* Patch renderList */
const _origRenderList = renderList;

renderList = function(list) {
  const el = document.getElementById('productList');
  const tpl = document.getElementById('tplProduct');

  el.innerHTML = '';

  if (!list.length) {
    el.innerHTML = '<li class="empty-msg" style="padding:20px;">Không tìm thấy</li>';
    return;
  }

  list.forEach(p => {
    const clone = tpl.content.cloneNode(true);
    const li = clone.querySelector('.p-item');

    li.querySelector('.p-name').textContent = p.name;

    if (basket.has(p.id)) li.classList.add('in-basket');
    if (selectedId === p.id) li.classList.add('selected');

    li.addEventListener('click', () => onClickProduct(p.id));

    el.appendChild(clone);
  });
};

/* Patch renderBasket */
const _origRenderBasket = renderBasket;

renderBasket = function() {
  const el = document.getElementById('basket');
  const tpl = document.getElementById('tplChip');

  el.innerHTML = '';

  if (!basket.size) {
    el.innerHTML = '<span style="font-size:12px;color:var(--muted);font-style:italic;">Chưa chọn sản phẩm nào</span>';
    return;
  }

  [...basket].forEach(id => {
    const p = products.find(x => x.id === id);

    const clone = tpl.content.cloneNode(true);

    clone.querySelector('.b-name').textContent = p ? p.name : '#' + id;

    clone.querySelector('.b-rm')
      .addEventListener('click', () => removeFromBasket(id));

    el.appendChild(clone);
  });
};

/* Patch renderRec */
const _origRenderRec = renderRec;

renderRec = function(data) {
  const area = document.getElementById('recArea');
  const badge = document.getElementById('recCount');

  area.innerHTML = '';

  if (!data || !data.length) {
    badge.style.display = 'none';

    area.innerHTML = `
      <div class="empty-msg">
        Không tìm thấy gợi ý phù hợp
      </div>
    `;

    return;
  }

  badge.textContent = data.length + ' sản phẩm';
  badge.style.display = 'inline-flex';

  const max = data[0].support;

  data.slice(0, 10).forEach((r, i) => {
    const pct = Math.round(r.support / max * 100);

    const div = document.createElement('div');

    div.className = 'rec-item';

    div.innerHTML = `
      <div class="rec-top">
        <span class="rec-rank">#${i + 1}</span>
        <span class="rec-name">${r.name}</span>
        <span class="rec-sup">SUP: ${r.support.toFixed(0)}</span>
      </div>

      <div class="rec-bar-bg">
        <div class="rec-bar" style="width:${pct}%"></div>
      </div>
    `;

    div.addEventListener('click', () => onClickProduct(r.productId ?? r.id));

    area.appendChild(div);
  });
};

/* Patch renderDetail */
const _origRenderDetail = renderDetail;

renderDetail = function(d) {
  const fmt = v => (v && v !== 'null') ? v : '—';

  const fmtPrice = v =>
    v > 0
      ? '$' + Number(v).toLocaleString('en-US', {
          minimumFractionDigits: 2
        })
      : 'Liên hệ';

  document.getElementById('detailBody').innerHTML = `
    <div class="detail-name">${fmt(d.name)}</div>

    <div class="detail-price">${fmtPrice(d.price)}</div>

    ${d.category
      ? `<div class="detail-cat">
          <span>${fmt(d.category)}</span> › ${fmt(d.subCategory)}
        </div>`
      : ''
    }

    <table class="detail-table">
      <tr>
        <td>Màu sắc</td>
        <td>${fmt(d.color)}</td>
      </tr>

      <tr>
        <td>Kích thước</td>
        <td>${fmt(d.size)}</td>
      </tr>

      <tr>
        <td>Cân nặng</td>
        <td>
          ${d.weight > 0
            ? d.weight + ' ' + (d.weightUnitMeasureCode || '')
            : '—'
          }
        </td>
      </tr>
    </table>

    ${d.description
      ? `<div class="detail-desc">${d.description}</div>`
      : ''
    }
  `;

  const btn = document.getElementById('btnAddBasket');

  btn.style.display = 'flex';

  updateBtnBasket();
};