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
          <p class="text-secondary mb-2" style="font-size:12px;">Mã: ${fmt(d.productNumber)}</p>
          <p class="text-success fw-bold fs-5 mb-2">${fmtPrice(d.price)}</p>
          ${d.category ? `<span class=" mb-3">${fmt(d.category)} › ${fmt(d.subCategory)}</span>` : ""}
          <table class="table table-sm table-borderless" style="font-size:13px;">
            <tr><td class="text-secondary">Màu sắc</td><td>${fmt(d.color)}</td></tr>
            <tr><td class="text-secondary">Kích thước</td><td>${fmt(d.size)}</td></tr>
            <tr><td class="text-secondary">Cân nặng</td><td>${d.weight > 0 ? d.weight + " kg" : ""}</td></tr>
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
