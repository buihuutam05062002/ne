const LOCALHOST = "http://localhost:8080";
let basket = new Set();
let products = [];
let selectedId = null;

async function getProducts() {
  const res = await fetch(LOCALHOST + "/products");
  return res.json();
}

async function getProductDetail(id) {
  const res = await fetch(LOCALHOST + "/products/" + id);
  return res.json();
}

async function getRecommendations(basketItems) {
  const res = await fetch(LOCALHOST + "/recommend?K=1000", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([...basketItems]),
  });
  return res.json();
}

function renderList(list) {
  const el = document.getElementById("productList");
  const tpl = document.getElementById("tplProduct");
  el.innerHTML = "";

  if (!list.length) {
    el.innerHTML =
      '<li class="text-secondary text-center mt-3" style="font-size:13px">Không tìm thấy</li>';
    return;
  }

  list.forEach((p) => {
    const clone = tpl.content.cloneNode(true);
    const li = clone.querySelector(".p-item");

    li.querySelector(".p-name").textContent = p.name;

    if (basket.has(p.id)) {
      li.querySelector(".p-check").style.opacity = "1";
      li.style.borderLeftColor = "#20b26a";
      li.classList.add("bg-success", "bg-opacity-10");
    }
    if (selectedId === p.id) li.classList.add("fw-semibold");

    li.addEventListener("click", () => onClickProduct(p.id));
    el.appendChild(clone);
  });
}

function renderBasket() {
  const el = document.getElementById("basket");
  const tpl = document.getElementById("tplChip");
  el.innerHTML = "";

  if (!basket.size) {
    el.innerHTML =
      '<span class="text-secondary fst-italic" style="font-size:13px">Chưa chọn sản phẩm nào</span>';
    return;
  }

  [...basket].forEach((id) => {
    const p = products.find((x) => x.id === id);
    const clone = tpl.content.cloneNode(true);
    clone.querySelector(".b-name").textContent = p ? p.name : "#" + id;
    clone
      .querySelector(".b-rm")
      .addEventListener("click", () => removeFromBasket(id));
    el.appendChild(clone);
  });
}

function renderRec(data) {
  const area = document.getElementById("recArea");
  const count = document.getElementById("recCount");
  const tpl = document.getElementById("tplRec");
  area.innerHTML = "";

  if (!data.length) {
    count.textContent = "";
    area.innerHTML =
      '<p class="text-secondary text-center mt-4" style="font-size:13px">Không tìm thấy gợi ý phù hợp</p>';
    return;
  }

  count.textContent = data.length + " sản phẩm";
  const max = data[0].support;

  data.slice(0, 10).forEach((r, i) => {
    const clone = tpl.content.cloneNode(true);
    clone.querySelector(".r-rank").textContent = "#" + (i + 1);
    clone.querySelector(".r-name").textContent = r.name;
    clone.querySelector(".r-bar").style.width =
      Math.round((r.support / max) * 100) + "%";
    clone.querySelector(".r-pct").textContent = "SUP: " + r.support.toFixed(0);
    const row = clone.querySelector("div");
    row.style.cursor = "pointer";
    row.addEventListener("click", () => onClickProduct(r.productId));
    area.appendChild(clone);
  });
}

function renderDetail(d) {
  const fmt = (v) => (v && v !== "null" ? v : "...");
  const fmtPrice = (v) =>
    v > 0
      ? "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: 2 })
      : "Liên hệ";

  document.getElementById("detailBody").innerHTML = `
          <p class="fw-bold mb-1">${fmt(d.name)}</p>
          <p class="text-success fw-bold fs-5 mb-2">${fmtPrice(d.price)}</p>
          ${d.category ? `<span class=" mb-3">${fmt(d.category)} › ${fmt(d.subCategory)}</span>` : ""}
          <table class="table table-sm table-borderless" style="font-size:13px;">
            <tr><td class="text-secondary">Màu sắc</td><td>${fmt(d.color)}</td></tr>
            <tr><td class="text-secondary">Kích thước</td><td>${fmt(d.size)}</td></tr>
            <tr><td class="text-secondary">Cân nặng</td><td>${d.weight > 0 ? d.weight + ' ' + (d.weightUnitMeasureCode  || '') : ''}</td></tr>
          </table>
          ${d.description ? `<p class="bg-light rounded p-2 mt-2" style="font-size:13px;">${d.description}</p>` : ""}
        `;

  const btn = document.getElementById("btnAddBasket");
  btn.style.display = "block";
  updateBtnBasket();
}   

function updateBtnBasket() {
  const btn = document.getElementById("btnAddBasket");
  if (basket.has(selectedId)) {
    btn.textContent = "Xóa khỏi giỏ hàng";
    btn.className = "btn btn-danger btn-sm w-100";
  } else {
    btn.textContent = "Thêm vào giỏ hàng";
    btn.className = "btn btn-success btn-sm w-100";
  }
}

async function onClickProduct(id) {
  selectedId = id;
  renderList(products);
  document.getElementById("detailBody").innerHTML =
    '<p class="text-secondary text-center mt-4" style="font-size:13px;">Đang tải...</p>';

  const detail = await getProductDetail(id);
  renderDetail(detail);


  const previewBasket = new Set(basket);
  previewBasket.add(id);

  document.getElementById("recArea").innerHTML =
    '<p class="text-secondary text-center mt-4" style="font-size:13px;">Đang tìm gợi ý...</p>';
  const data = await getRecommendations(previewBasket);

  const filtered = data.filter((r) => r.id !== id && !basket.has(r.id));
  renderRec(filtered);
  
  console.log("onClickProduct called with id:", id, typeof id);
  selectedId = id;
}

async function onToggleBasket() {
  if (selectedId === null) return;

  if (basket.has(selectedId)) {
    basket.delete(selectedId);
  } else {
    const ok = confirm("Bạn có muốn thêm sản phẩm này vào giỏ hàng không?");
    if (!ok) return;
    basket.add(selectedId);
  }

  updateBtnBasket();
  renderList(products);
  renderBasket();
  await updateRecommendations();
}

async function removeFromBasket(id) {
  basket.delete(id);
  if (selectedId === id) updateBtnBasket();
  renderList(products);
  renderBasket();
  await updateRecommendations();
}

async function updateRecommendations() {
  if (basket.size > 0 || selectedId !== null) {
    const previewBasket = new Set(basket);
    if (selectedId) previewBasket.add(selectedId);

    document.getElementById("recArea").innerHTML =
      '<p class="text-secondary text-center mt-4" style="font-size:13px;">Đang tìm gợi ý...</p>';
    const data = await getRecommendations(previewBasket);
    const filtered = data.filter(
      (r) => !basket.has(r.id) && r.id !== selectedId,
    );
    renderRec(filtered);
  } else {
    document.getElementById("recCount").textContent = "";
    document.getElementById("recArea").innerHTML =
      '<p class="text-secondary text-center mt-4" style="font-size:13px;">Chọn sản phẩm để xem gợi ý</p>';
  }
}

function filterProducts() {
  const kw = document.getElementById("searchInput").value.toLowerCase();
  renderList(
    kw ? products.filter((p) => p.name.toLowerCase().includes(kw)) : products,
  );
}

window.addEventListener("DOMContentLoaded", async () => {
  const data = await getProducts();
  if (!data.length) return;
  products = data;
  document.getElementById("productCount").textContent =
    products.length + " sản phẩm";
  document.getElementById("searchInput").disabled = false;
  renderList(products);
});


/* */

    function toast(msg, type = 'info', duration = 3000) {
      const icons = {
        success: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
        error:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
        info:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
      };
      const el = document.createElement('div');
      el.className = `toast ${type}`;
      el.innerHTML = `${icons[type]||''}<span>${msg}</span>`;
      document.getElementById('toastContainer').appendChild(el);
      setTimeout(() => { el.style.opacity='0'; el.style.transition='opacity .3s'; setTimeout(()=>el.remove(),300); }, duration);
    }

    function renderSkeletonRec(n = 5) {
      const area = document.getElementById('recArea');
      area.innerHTML = Array.from({length: n}, () => `
        <div style="padding:10px 16px;border-bottom:1px solid var(--border);">
          <div class="skeleton skel-name" style="width:70%"></div>
          <div class="skeleton skel-bar"></div>
        </div>`).join('');
    }




     const _origRenderList = renderList;
    function renderList(list) {
      const el  = document.getElementById('productList');
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
        if (basket.has(p.id))    li.classList.add('in-basket');
        if (selectedId === p.id) li.classList.add('selected');
        li.addEventListener('click', () => onClickProduct(p.id));
        el.appendChild(clone);
      });
    }

    
    const _origRenderBasket = renderBasket;
    function renderBasket() {
      const el  = document.getElementById('basket');
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
        clone.querySelector('.b-rm').addEventListener('click', () => removeFromBasket(id));
        el.appendChild(clone);
      });
    }

    
    const _origRenderRec = renderRec;
    function renderRec(data) {
      const area  = document.getElementById('recArea');
      const badge = document.getElementById('recCount');
      area.innerHTML = '';
      if (!data || !data.length) {
        badge.style.display = 'none';
        area.innerHTML = `<div class="empty-msg">
          Không tìm thấy gợi ý phù hợp
        </div>`;
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
            <span class="rec-rank">#${i+1}</span>
            <span class="rec-name">${r.name}</span>
            <span class="rec-sup">SUP: ${r.support.toFixed(0)}</span>
          </div>
          <div class="rec-bar-bg"><div class="rec-bar" style="width:${pct}%"></div></div>`;
        div.addEventListener('click', () => onClickProduct(r.productId ?? r.id));
        area.appendChild(div);
      });
    }

    
    const _origRenderDetail = renderDetail;
    function renderDetail(d) {
      const fmt = v => (v && v !== 'null') ? v : '—';
      const fmtPrice = v => v > 0
        ? '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })
        : 'Liên hệ';

      document.getElementById('detailBody').innerHTML = `
        <div class="detail-name">${fmt(d.name)}</div>
        <div class="detail-price">${fmtPrice(d.price)}</div>
        ${d.category ? `<div class="detail-cat"><span>${fmt(d.category)}</span> › ${fmt(d.subCategory)}</div>` : ''}
        <table class="detail-table">
          <tr><td>Màu sắc</td><td>${fmt(d.color)}</td></tr>
          <tr><td>Kích thước</td><td>${fmt(d.size)}</td></tr>
          <tr><td>Cân nặng</td><td>${d.weight > 0 ? d.weight + ' ' + (d.weightUnitMeasureCode || '') : '—'}</td></tr>
        </table>
        ${d.description ? `<div class="detail-desc">${d.description}</div>` : ''}
      `;
      const btn = document.getElementById('btnAddBasket');
      btn.style.display = 'flex';
      updateBtnBasket();
    }

    
    const _origUpdateBtn = updateBtnBasket;
    function updateBtnBasket() {
      const btn = document.getElementById('btnAddBasket');
      if (!btn || selectedId === null) return;
      if (basket.has(selectedId)) {
        btn.innerHTML = `Xóa khỏi giỏ hàng`;
        btn.className = 'btn-basket remove';
      } else {
        btn.innerHTML = `Thêm vào giỏ hàng`;
        btn.className = 'btn-basket add';
      }
    }

    
    const _origOnClick = onClickProduct;
    async function onClickProduct(id) {
      selectedId = id;
      renderList(products);
      // Skeleton for detail
      document.getElementById('detailBody').innerHTML = `
        <div style="padding:16px;">
          <div class="skeleton skel-name" style="width:85%;height:14px;margin-bottom:10px;"></div>
          <div class="skeleton skel-name" style="width:40%;height:22px;margin-bottom:14px;"></div>
          <div class="skeleton skel-name" style="width:55%;height:10px;margin-bottom:16px;"></div>
          <div class="skeleton skel-name" style="width:100%;height:10px;margin-bottom:6px;"></div>
          <div class="skeleton skel-name" style="width:100%;height:10px;margin-bottom:6px;"></div>
          <div class="skeleton skel-name" style="width:80%;height:10px;"></div>
        </div>`;
      document.getElementById('btnAddBasket').style.display = 'none';
      // Skeleton for rec
      renderSkeletonRec();

      try {
        const detail = await getProductDetail(id);
        renderDetail(detail);
      } catch(e) {
        document.getElementById('detailBody').innerHTML = `<div class="empty-msg" style="color:var(--red)">Không tải được thông tin</div>`;
      }

      const previewBasket = new Set(basket);
      previewBasket.add(id);
      try {
        const data = await getRecommendations(previewBasket);
        const filtered = data.filter(r => r.id !== id && !basket.has(r.id));
        renderRec(filtered);
      } catch(e) {
        document.getElementById('recArea').innerHTML = `<div class="empty-msg" style="color:var(--red)">Không tải được gợi ý</div>`;
      }
    }

    
    const _origToggle = onToggleBasket;
    async function onToggleBasket() {
      if (selectedId === null) return;
      const p = products.find(x => x.id === selectedId);
      const name = p ? p.name : '#' + selectedId;
      if (basket.has(selectedId)) {
        basket.delete(selectedId);
        toast(`Đã xóa "${name}" khỏi giỏ`, 'info');
      } else {
        basket.add(selectedId);
        toast(`Đã thêm "${name}" vào giỏ`, 'success');
      }
      updateBtnBasket();
      renderList(products);
      renderBasket();
      await updateRecommendations();
    }

    
    const _origRemove = removeFromBasket;
    async function removeFromBasket(id) {
      const p = products.find(x => x.id === id);
      basket.delete(id);
      if (selectedId === id) updateBtnBasket();
      renderList(products);
      renderBasket();
      toast(`Đã xóa "${p ? p.name : '#'+id}" khỏi giỏ`, 'info');
      await updateRecommendations();
    }