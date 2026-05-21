    const LOCALHOST = 'http://localhost:8080';
    let PRODUCT_MAP  = {};
    let ALL_PRODUCTS = [];
    let _allRows     = [];
    let _maxSup      = 1;
    let _sortCol     = 'support';
    let _sortAsc     = false;
    let _frequentIds = new Set();

    async function loadProducts() {
      try {
        const res  = await fetch(LOCALHOST + '/products');
        const data = await res.json();
        data.forEach(p => PRODUCT_MAP[String(p.id)] = p.name);
        ALL_PRODUCTS = data.map(p => ({ id: String(p.id), name: p.name })).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        renderSidebar();
      } catch (e) {
        document.getElementById('sidebarList').innerHTML = '<li class="sidebar-empty">Không thể tải sản phẩm</li>';
      }
    }

    function resolveName(id) { return PRODUCT_MAP[String(id).trim()] || String(id); }

    function renderSidebar(filterKw) {
      const list  = document.getElementById('sidebarList');
      const kw    = (filterKw || '').toLowerCase();
      const items = kw ? ALL_PRODUCTS.filter(p => p.name.toLowerCase().includes(kw) || p.id.includes(kw)) : ALL_PRODUCTS;
      if (!items.length) { list.innerHTML = '<li class="sidebar-empty">Không tìm thấy sản phẩm</li>'; return; }
      list.innerHTML = items.map(p => {
        const isFrequent = _frequentIds.has(p.id);
        const cls = isFrequent ? 'frequent' : (_frequentIds.size > 0 ? 'dimmed' : '');
        return `<li class="s-item ${cls}" title="${p.name} (ID: ${p.id})">
          <div class="s-dot"></div>
          <span class="s-name">${p.name}</span>
          <span class="s-check">✓</span>
        </li>`;
      }).join('');
    }

    function filterSidebar() { renderSidebar(document.getElementById('sidebarSearch').value); }

    function updateSidebarHighlight(rows) {
      _frequentIds = new Set();
      rows.forEach(r => r.items.forEach(id => _frequentIds.add(String(id).trim())));
      renderSidebar(document.getElementById('sidebarSearch').value);
    }

    function toast(msg, type = 'info', duration = 3500) {
      const icons = {
        success: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7f37" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
        error:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cf222e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
        info:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0969da" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
      };
      const el = document.createElement('div');
      el.className = `toast ${type}`;
      el.innerHTML = `${icons[type] || ''}<span>${msg}</span>`;
      document.getElementById('toastContainer').appendChild(el);
      setTimeout(() => { el.style.opacity='0'; el.style.transition='opacity .3s'; setTimeout(() => el.remove(), 300); }, duration);
    }

    function setStatus(state, text) {
      document.getElementById('statusDot').className = `status-dot ${state}`;
      document.getElementById('statusText').textContent = text;
    }

    function setStats(s) {
      document.getElementById('statTrans').textContent  = s.numOfTrans  ?? '—';
      document.getElementById('stat1Item').textContent  = s.numOfFItem  ?? '—';
      document.getElementById('statClosed').textContent = s.outputCount ?? '—';
    }

    function parseResponse(raw) {
      try {
        const j = JSON.parse(raw);
        if (j && Array.isArray(j.itemsets)) {
          return { itemsets: j.itemsets.map(r => ({ items: Array.isArray(r.items) ? r.items.map(String) : String(r.items).split(/[,;]/).map(s=>s.trim()), support: Number(r.support)||0 })) };
        }
        if (Array.isArray(j)) {
          return { itemsets: j.map(r => ({ items: Array.isArray(r.items) ? r.items.map(String) : ['?'], support: Number(r.support)||0 })) };
        }
      } catch {}
      const lines = raw.trim().split('\n').filter(Boolean);
      const itemsets = [];
      for (const line of lines) {
        const colonIdx = line.lastIndexOf(':');
        if (colonIdx === -1) continue;
        const supNum = parseFloat(line.slice(colonIdx + 1).trim());
        if (isNaN(supNum)) continue;
        const items = line.slice(0, colonIdx).trim().split(/[,;\s]+/).map(s=>s.trim()).filter(Boolean);
        if (items.length) itemsets.push({ items, support: supNum });
      }
      return { itemsets };
    }

    function renderRows(rows) {
      const tbody = document.getElementById('itemsetBody');
      if (!rows.length) { tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state"><span>Không tìm thấy kết quả</span></div></td></tr>`; return; }
      tbody.innerHTML = rows.map((r, i) => {
        const pct  = Math.round(r.support / _maxSup * 100);
        const tags = r.items.map(id => `<span class="tag" title="ID: ${id}">${resolveName(id)}</span>`).join('');
        return `<tr>
          <td class="td-num">${i + 1}</td>
          <td>${tags}</td>
          <td class="td-sup"><div class="sup-num">${r.support}</div><div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div></td>
        </tr>`;
      }).join('');
    }

    function sortRows(rows) {
      return [...rows].sort((a, b) => {
        let va, vb;
        if (_sortCol === 'support') { va = a.support; vb = b.support; }
        else { va = a.items.map(resolveName).join(','); vb = b.items.map(resolveName).join(','); }
        return _sortAsc ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
      });
    }
    function sortByCol(col) { if (_sortCol === col) _sortAsc = !_sortAsc; else { _sortCol = col; _sortAsc = col !== 'support'; } applyFilterAndSort(); }
    function toggleSort() { _sortAsc = !_sortAsc; document.getElementById('sortLabel').textContent = _sortAsc ? 'Support ↑' : 'Support ↓'; applyFilterAndSort(); }
    function filterTable() { applyFilterAndSort(); }
    function applyFilterAndSort() {
      const kw = document.getElementById('filterInput').value.toLowerCase();
      const rows = kw ? _allRows.filter(r => r.items.some(id => resolveName(id).toLowerCase().includes(kw) || id.toString().includes(kw))) : _allRows;
      renderRows(sortRows(rows));
    }

    function exportCSV() {
      if (!_allRows.length) { toast('Chưa có dữ liệu để xuất', 'error'); return; }
      const kw = document.getElementById('filterInput').value.toLowerCase();
      const rows = kw ? _allRows.filter(r => r.items.some(id => resolveName(id).toLowerCase().includes(kw))) : _allRows;
      const csv = ['#,Tập mục,Support', ...sortRows(rows).map((r, i) => `${i+1},"${r.items.map(resolveName).join('; ')}",${r.support}`)].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `itemsets_${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast('Đã xuất file CSV', 'success');
    }

    async function sendData() {
      const file   = document.getElementById('transactionFile').files[0];
      const minSup = document.getElementById('minSupport').value.trim();
      if (!file)   { toast('Vui lòng chọn file giao dịch (.txt)', 'error'); return; }
      if (!minSup) { toast('Vui lòng nhập giá trị min support', 'error');   return; }

      setStatus('busy', 'Đang khai thác...');
      document.getElementById('btnRun').disabled = true;
      document.getElementById('itemsetBody').innerHTML = `<tr class="loading-row"><td colspan="3"><span class="spinner-inline"></span>Đang xử lý, vui lòng chờ...</td></tr>`;
      ['statTrans','stat1Item','statClosed'].forEach(id => { document.getElementById(id).innerHTML = '<span class="stat-skeleton"></span>'; });

      try {
        const fd = new FormData();
        fd.append('transactionFile', file);
        fd.append('minSupport', minSup);

        const miningRes = await fetch(LOCALHOST + '/mining', { method: 'POST', body: fd });
        if (!miningRes.ok) throw new Error(`Server trả lỗi ${miningRes.status}`);
        const raw  = await miningRes.text();
        const rows = parseResponse(raw).itemsets || [];

        const statsRes = await fetch(LOCALHOST + '/stats');
        if (!statsRes.ok) throw new Error(`Không lấy được thống kê`);
        const stats = await statsRes.json();

        _allRows = rows;
        _maxSup  = rows.length ? Math.max(...rows.map(r => r.support), 1) : 1;
        setStats(stats);
        updateSidebarHighlight(rows);
        applyFilterAndSort();
        setStatus('done', 'Đã khai thác xong');
        toast(`Tìm được ${stats.outputCount} tập mục đóng`, 'success');

      } catch (err) {
        setStatus('error', 'Khai thác thất bại');
        toast('Lỗi: ' + err.message, 'error', 5000);
        document.getElementById('itemsetBody').innerHTML = `<tr><td colspan="3"><div class="empty-state" style="color:var(--red)"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>${err.message}</div></td></tr>`;
        ['statTrans','stat1Item','statClosed'].forEach(id => { document.getElementById(id).textContent = '—'; });
      } finally {
        document.getElementById('btnRun').disabled = false;
      }
    }

    loadProducts();