const API_URL = "https://script.google.com/macros/s/AKfycbzROijSMlW53vyDqMgYIGWWjVM_qIg9sEcjTuRKXPOFSOw-0e-fqs3wMBL6UcJzLpPV/exec";

let globalData = {};

// Fungsi untuk pindah antar 4 Tab Halaman
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
    // 1. Tab 1: Profile (About Ravenion & Leadroom)
    if (data.profil && data.profil.length > 0) {
        document.getElementById("nama-kamar").innerText = data.profil[0].Isi || "Ravenion";
        document.getElementById("slogan-kamar").innerText = data.profil[1]?.Isi || "";
        document.getElementById("desc-kamar").innerText = data.profil[2]?.Isi || "";
    }

    if (data.leadroom && data.leadroom.length > 0) {
        let lead = data.leadroom[data.leadroom.length - 1];
        document.getElementById("leadroom-card").innerHTML = `
            <img src="${lead.Foto}" alt="${lead.Nama}">
            <h3>${lead.Nama} (${lead.Periode})</h3>
            <p style="color: #94a3b8; font-style: italic;">"${lead.Quote}"</p>
        `;
    }

    // 2. Tab 2: Part of Us (Ravenion's Soldiers / Penghuni Bulan Ini)
    let gridPenghuni = document.getElementById("grid-penghuni");
    gridPenghuni.innerHTML = "";
    if (data.penghuniAktif && data.penghuniAktif.length > 0) {
        data.penghuniAktif.forEach(anak => {
            gridPenghuni.innerHTML += `
                <div class="card-anak">
                    <img src="${anak.FotoURL}" alt="${anak.Nama}">
                    <h4 style="margin: 5px 0;">${anak.Nama}</h4>
                    <p class="vc-badge">VC: ${anak.VC}</p>
                </div>
            `;
        });
    } else {
        gridPenghuni.innerHTML = "<p style='color: #94a3b8;'>Belum ada data penghuni bulan ini di Google Sheets.</p>";
    }

    // 3. Tab 3: Summaries (Arsip Rangkuman)
    let listRangkuman = document.getElementById("list-rangkuman");
    listRangkuman.innerHTML = "";
    if (data.arsipRangkuman && data.arsipRangkuman.length > 0) {
        data.arsipRangkuman.forEach(r => {
            listRangkuman.innerHTML += `
                <div class="item-rangkuman" style="margin-bottom: 15px; padding: 15px; background: #152242; border-radius: 8px; border-left: 3px solid #c5a059;">
                    <strong style="color: #c5a059; font-size: 1.1em;">[${r.Bulan}] ${r.JudulRangkuman}</strong>
                    <p style="margin: 8px 0 0 0; color: #94a3b8; line-height: 1.5;">${r.IsiCerita}</p>
                </div>
            `;
        });
    } else {
        listRangkuman.innerHTML = "<p style='color: #94a3b8;'>Belum ada arsip rangkuman.</p>";
    }

    // 4. Tab 4: Memories (Arsip Nion's Soldier per Bulan & Tahun, misal: September 2026, Oktober 2026)
    let selectBulan = document.getElementById("select-bulan");
    if (data.arsipAnak && data.arsipAnak.length > 0) {
        let uniqueMonths = [...new Set(data.arsipAnak.map(item => item.Bulan))];
        selectBulan.innerHTML = `<option value="">Pilih Periode Bulan (Contoh: September 2026)...</option>`;
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
        gridArsipAnak.innerHTML += `
            <div class="card-anak">
                <img src="${anak.FotoURL}" alt="${anak.Nama}">
                <h4 style="margin: 5px 0;">${anak.Nama}</h4>
            </div>
        `;
    });
}

// Jalankan saat web dibuka
fetchKamarData();