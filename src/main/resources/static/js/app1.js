const LOCALHOST = "http://localhost:8080";

async function sendData() {
  const transactionFile = document.getElementById("transactionFile").files[0];
  const minSupport = document.getElementById("minSupport").value;

  try {
    const formData = new FormData();
    formData.append("transactionFile", transactionFile);
    formData.append("minSupport", minSupport);

    const res = await fetch(LOCALHOST + "/mining", {
      method: "POST",
      body: formData,
    });
    const itemsets = await res.json();
    const mapRes = await fetch(LOCALHOST + "/productmap");
    const productMap = await mapRes.json();

    const statsRes = await fetch(LOCALHOST + "/stats");
    const stats = await statsRes.json();

    renderStats(stats);

    renderItemsets(itemsets, productMap);
  } catch (err) {
    alert("Lỗi: " + err.message);
  }
}
function renderItemsets(itemsets, productMap) {
  const tbody = document.getElementById("itemsetBody");
  const resultSection = document.getElementById("resultSection");
  tbody.innerHTML = "";

  itemsets.forEach((itemset, index) => {
    const names = itemset.items.map((id) => productMap[id] ?? "SP #" + id);
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${names.join("; ")}</td>
            <td><span class="badge bg-primary">${itemset.support}</span></td>
        `;
    tbody.appendChild(tr);
  });

  resultSection.style.display = "block";
}

function renderStats(stats) {
  document.getElementById("statTrans").textContent = stats.numOfTrans;
  document.getElementById("stat1Item").textContent = stats.numOfFItem;
  document.getElementById("statClosed").textContent = stats.outputCount;
}
