const API_URL = "https://script.google.com/macros/s/AKfycbzROijSMlW53vyDqMgYIGWWjVM_qIg9sEcjTuRKXPOFSOw-0e-fqs3wMBL6UcJzLpPV/exec";

let globalData = {};

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
    // 1. Render Profil
    if (data.profil && data.profil.length > 0) {
        document.getElementById("nama-kamar").innerText = data.profil[0].Isi || "Kamar Rahasia";
        document.getElementById("slogan-kamar").innerText = data.profil[1]?.Isi || "";
        document.getElementById("desc-kamar").innerText = data.profil[2]?.Isi || "";
    }

    // 2. Render Leadroom
    if (data.leadroom && data.leadroom.length > 0) {
        let lead = data.leadroom[data.leadroom.length - 1];
        document.getElementById("leadroom-card").innerHTML = `
            <img src="${lead.Foto}" alt="${lead.Nama}">
            <h3>${lead.Nama} (${lead.Periode})</h3>
            <p>"${lead.Quote}"</p>
        `;
    }

    // 3. Render Penghuni Aktif (Bulan Ini) dengan label VC
    let gridPenghuni = document.getElementById("grid-penghuni");
    gridPenghuni.innerHTML = "";
    if (data.penghuniAktif && data.penghuniAktif.length > 0) {
        data.penghuniAktif.forEach(anak => {
            gridPenghuni.innerHTML += `
                <div class="card-anak">
                    <img src="${anak.FotoURL}" alt="${anak.Nama}">
                    <h4>${anak.Nama}</h4>
                    <p class="vc-badge">VC: ${anak.VC}</p>
                </div>
            `;
        });
    } else {
        gridPenghuni.innerHTML = "<p>Belum ada data penghuni bulan ini.</p>";
    }

    // 4. Render Arsip Rangkuman
    let listRangkuman = document.getElementById("list-rangkuman");
    listRangkuman.innerHTML = "";
    if (data.arsipRangkuman && data.arsipRangkuman.length > 0) {
        data.arsipRangkuman.forEach(r => {
            listRangkuman.innerHTML += `
                <div class="item-rangkuman" style="margin-bottom: 10px; padding: 10px; background: #222227; border-radius: 6px;">
                    <strong>[${r.Bulan}] ${r.JudulRangkuman}</strong>
                    <p>${r.IsiCerita}</p>
                </div>
            `;
        });
    }

    // 5. Setup Dropdown Arsip Anak Berdasarkan Bulan
    let selectBulan = document.getElementById("select-bulan");
    if (data.arsipAnak && data.arsipAnak.length > 0) {
        let uniqueMonths = [...new Set(data.arsipAnak.map(item => item.Bulan))];
        selectBulan.innerHTML = `<option value="">Pilih Bulan...</option>`;
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
    filtered.forEach(anak => {
        gridArsipAnak.innerHTML += `
            <div class="card-anak">
                <img src="${anak.FotoURL}" alt="${anak.Nama}">
                <h4>${anak.Nama}</h4>
            </div>
        `;
    });
}

// Jalankan saat web dibuka
fetchKamarData();