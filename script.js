const API_URL = "https://script.google.com/macros/s/AKfycbzROijSMlW53vyDqMgYIGWWjVM_qIg9sEcjTuRKXPOFSOw-0e-fqs3wMBL6UcJzLpPV/exec";

let globalData = {};

function switchPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active-page');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`page-${pageId}`).classList.add('active-page');
    event.target.classList.add('active');
}

async function fetchKamarData() {
    try {
        let response = await fetch(`${API_URL}?action=all`);
        let data = await response.json();
        globalData = data;
        renderWebsite(data);
    } catch (error) {
        console.error("Gagal mengambil data:", error);
    }
}

function renderWebsite(data) {
    // 1. Tab 1: Profile (Membaca baris Profil & Slogan & Deskripsi dari Sheet)
    if (data.profil && data.profil.length > 0) {
        data.profil.forEach(row => {
            if (row.Bagian === "NamaKamar") document.getElementById("nama-kamar").innerText = row.Isi;
            if (row.Bagian === "Slogan") document.getElementById("slogan-kamar").innerText = row.Isi;
            if (row.Bagian === "Deskripsi") document.getElementById("desc-kamar").innerText = row.Isi;
        });
    }

    // Leadroom
    if (data.leadroom && data.leadroom.length > 0) {
        let lead = data.leadroom[data.leadroom.length - 1];
        document.getElementById("leadroom-card").innerHTML = `
            <img src="${lead.Foto}" alt="${lead.Nama}">
            <h3>${lead.Nama}</h3>
            <p style="color: #c5a059; font-weight: bold; margin: 5px 0;">Vault Code: ${lead.VaultCode || lead['Vault Code'] || '-'}</p>
        `;
    }

    // 2. Tab 2: Part of Us (Penghuni Aktif)
    let gridPenghuni = document.getElementById("grid-penghuni");
    gridPenghuni.innerHTML = "";
    if (data.penghuniAktif && data.penghuniAktif.length > 0) {
        data.penghuniAktif.forEach(anak => {
            gridPenghuni.innerHTML += `
                <div class="card-anak">
                    <img src="${anak.Foto}" alt="${anak.Nama}">
                    <h4 style="margin: 5px 0;">${anak.Nama}</h4>
                    <p style="color: #94a3b8; font-size: 0.85em; margin: 0;">${anak.Username || ''}</p>
                    <p class="vc-badge">Vault Code: ${anak['Vault Code'] || anak.VC || '-'}</p>
                </div>
            `;
        });
    } else {
        gridPenghuni.innerHTML = "<p style='color: #94a3b8;'>Belum ada data penghuni bulan ini.</p>";
    }

    // 3. Tab 3: Summaries (Arsip Rangkuman)
    let listRangkuman = document.getElementById("list-rangkuman");
    listRangkuman.innerHTML = "";
    if (data.arsipRangkuman && data.arsipRangkuman.length > 0) {
        data.arsipRangkuman.forEach(r => {
            let judul = r['Judul Rangkuman'] || r.JudulRangkuman || 'Rangkuman';
            let link = r.Link || '#';
            listRangkuman.innerHTML += `
                <div class="item-rangkuman" style="margin-bottom: 15px; padding: 15px; background: #152242; border-radius: 8px; border-left: 3px solid #c5a059;">
                    <strong style="color: #c5a059; font-size: 1.1em;">[${r.Bulan}] ${judul}</strong>
                    <p style="margin: 8px 0 0 0;"><a href="${link}" target="_blank" style="color: #e2c07a; text-decoration: underline;">Buka Link Rangkuman &rarr;</a></p>
                </div>
            `;
        });
    } else {
        listRangkuman.innerHTML = "<p style='color: #94a3b8;'>Belum ada arsip rangkuman.</p>";
    }

    // 4. Tab 4: Memories (Arsip Anak)
    let selectBulan = document.getElementById("select-bulan");
    if (data.arsipAnak && data.arsipAnak.length > 0) {
        let uniqueMonths = [...new Set(data.arsipAnak.map(item => item.Bulan))];
        selectBulan.innerHTML = `<option value="">Pilih Periode Bulan...</option>`;
        uniqueMonths.forEach(bulan => {
            selectBulan.innerHTML += `<option value="${bulan}">${bulan}</option>`;
        });
    }
}

function filterArsipAnak() {
    let selectedMonth = document.getElementById("select-bulan").value;
    let gridArsipAnak = document.getElementById("grid-arsip-anak");
    gridArsipAnak.innerHTML = "";

    if (!selectedMonth || !globalData.arsipAnak) return;

    let filtered = globalData.arsipAnak.filter(item => item.Bulan === selectedMonth);
    if (filtered.length === 0) {
        gridArsipAnak.innerHTML = "<p style='color: #94a3b8;'>Tidak ada data untuk periode ini.</p>";
        return;
    }

    filtered.forEach(anak => {
        let vCode = anak['Vault Code'] || anak.VaultCode || '';
        gridArsipAnak.innerHTML += `
            <div class="card-anak">
                <img src="${anak.Foto}" alt="${anak.Nama}">
                <h4 style="margin: 5px 0;">${anak.Nama}</h4>
                ${vCode ? `<p class="vc-badge">Vault Code: ${vCode}</p>` : ''}
            </div>
        `;
    });
}

fetchKamarData();