/**
 * JAVASCRIPT SYSTEM ENGINE - DASHBOARD ADMIN PMB
 * PROTOTYPE MANAGE LOCALSTORAGE SYNCHRONIZATION REAL-TIME
 */

document.addEventListener("DOMContentLoaded", () => {
    const pendaftarList = document.getElementById("pendaftar-list");
    const emptyState = document.getElementById("empty-state");
    const searchBar = document.getElementById("search-bar");
    const filterStatus = document.getElementById("filter-status");
    const btnExport = document.getElementById("btn-export-csv");
    const btnInject = document.getElementById("btn-inject-mock");
    const themeToggle = document.getElementById("btn-theme-toggle");

    // Modal DOM Elements
    const detailModal = document.getElementById("detailModal");
    const modalDetailContent = document.getElementById("modalDetailContent");
    const closeModal = document.getElementById("closeModal");
    const btnCloseModal = document.getElementById("btnCloseModal");

    const MAIN_STORAGE_KEY = "spmb_tunas_melati_submitted_data";
    const DRAFT_KEY = "spmb_tunas_melati_draft";
    let dataPendaftar = [];

    // 1. Theme Configuration Engine Control
    const currentTheme = localStorage.getItem("admin_theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    themeToggle.textContent = currentTheme === "dark" ? "☀️ Mode Terang" : "🌙 Mode Gelap";

    themeToggle.addEventListener("click", () => {
        let theme = document.documentElement.getAttribute("data-theme");
        let newTheme = theme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("admin_theme", newTheme);
        themeToggle.textContent = newTheme === "dark" ? "☀️ Mode Terang" : "🌙 Mode Gelap";
    });

    // 2. Load Data from LocalStorage Database Core
    const loadDatabase = () => {
        const rawData = localStorage.getItem(MAIN_STORAGE_KEY);
        if (rawData) {
            try {
                dataPendaftar = JSON.parse(rawData);
            } catch (e) {
                console.error("Gagal parse database pendaftar.", e);
                dataPendaftar = [];
            }
        } else {
            dataPendaftar = [];
        }
        renderTable(dataPendaftar);
        calculateStatistics();
    };

    // 3. Render Table Data Row Elements
    const renderTable = (list) => {
        pendaftarList.innerHTML = "";
        
        if (list.length === 0) {
            emptyState.style.display = "block";
            return;
        }
        emptyState.style.display = "none";

        list.forEach((data, index) => {
            const tr = document.createElement("tr");

            let badgeClass = "proses";
            let iconStatus = "⏳";
            if (data.status === "Diterima") { badgeClass = "diterima"; iconStatus = "✅"; }
            if (data.status === "Ditolak") { badgeClass = "ditolak"; iconStatus = "❌"; }

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${data.p_nama || "-"}</strong><br><small style="color:var(--text-light)">Panggilan: ${data.p_panggilan || "-"}</small></td>
                <td><small>NIK: ${data.p_nik || "-"}<br>KK: ${data.p_kk || "-"}</small></td>
                <td>👨 ${data.a_nama || "-"}<br>👩 ${data.i_nama || "-"}</td>
                <td>📞 ${data.a_hp || data.i_hp || "-"}</td>
                <td><span class="status-badge ${badgeClass}">${iconStatus} ${data.status || "Proses"}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-primary-soft btn-view" data-id="${data.id}">👁 Detail</button>
                        <button class="btn btn-success btn-acc" data-id="${data.id}">🟢 Terima</button>
                        <button class="btn btn-danger btn-reject" data-id="${data.id}">🔴 Tolak</button>
                    </div>
                </td>
            `;
            pendaftarList.appendChild(tr);
        });

        attachActionListeners();
    };

    // 4. Statistics Calculation
    const calculateStatistics = () => {
        document.getElementById("stat-total").textContent = dataPendaftar.length;
        document.getElementById("stat-diterima").textContent = dataPendaftar.filter(d => d.status === "Diterima").length;
        document.getElementById("stat-proses").textContent = dataPendaftar.filter(d => d.status === "Proses" || !d.status).length;
        document.getElementById("stat-ditolak").textContent = dataPendaftar.filter(d => d.status === "Ditolak").length;
    };

    // 5. Filter & Real-Time Searching Engine
    const filterAndSearchHandler = () => {
        const keyword = searchBar.value.toLowerCase().trim();
        const statusValue = filterStatus.value;

        const filtered = dataPendaftar.filter(item => {
            const matchKeyword = 
                (item.p_nama && item.p_nama.toLowerCase().includes(keyword)) ||
                (item.p_nik && item.p_nik.includes(keyword)) ||
                (item.a_nama && item.a_nama.toLowerCase().includes(keyword)) ||
                (item.i_nama && item.i_nama.toLowerCase().includes(keyword));

            const currentItemStatus = item.status || "Proses";
            const matchStatus = (statusValue === "all") || (currentItemStatus === statusValue);

            return matchKeyword && matchStatus;
        });

        renderTable(filtered);
    };

    searchBar.addEventListener("input", filterAndSearchHandler);
    filterStatus.addEventListener("change", filterAndSearchHandler);

    // 6. Action Button Core Click Events Link (Terima / Tolak / Detail)
    const attachActionListeners = () => {
        document.querySelectorAll(".btn-acc").forEach(btn => {
            btn.addEventListener("click", (e) => {
                updateStatus(e.target.dataset.id, "Diterima");
            });
        });

        document.querySelectorAll(".btn-reject").forEach(btn => {
            btn.addEventListener("click", (e) => {
                updateStatus(e.target.dataset.id, "Ditolak");
            });
        });

        document.querySelectorAll(".btn-view").forEach(btn => {
            btn.addEventListener("click", (e) => {
                showDetailModal(e.target.dataset.id);
            });
        });
    };

    const updateStatus = (id, newStatus) => {
        dataPendaftar = dataPendaftar.map(item => {
            if (item.id == id) {
                item.status = newStatus;
            }
            return item;
        });
        localStorage.setItem(MAIN_STORAGE_KEY, JSON.stringify(dataPendaftar));
        loadDatabase();
    };

    // 7. Show Modal Detail Render View Matrix Data
    const showDetailModal = (id) => {
        const item = dataPendaftar.find(d => d.id == id);
        if (!item) return;

        let detailsHtml = `
            <div class="detail-section-title">👶 Identitas Calon Murid</div>
            <table class="detail-table">
                <tr><td>Nama Lengkap</td><td><strong>${item.p_nama || "-"}</strong></td></tr>
                <tr><td>Nama Panggilan</td><td>${item.p_panggilan || "-"}</td></tr>
                <tr><td>NIK / KK</td><td>NIK: ${item.p_nik || "-"} <br> KK: ${item.p_kk || "-"}</td></tr>
                <tr><td>Tempat, Tgl Lahir</td><td>${item.p_tempat_lahir || "-"}, ${item.p_tanggal_lahir || "-"}</td></tr>
                <tr><td>Agama / JK</td><td>${item.p_agama || "-"} / ${item.p_jk || "-"}</td></tr>
                <tr><td>Hubungan Anak</td><td>Anak Ke-${item.p_anak_ke || "-"} dari ${item.p_saudara || "-"} Bersaudara (${item.p_status_keluarga || "-"})</td></tr>
                <tr><td>Alamat Lengkap</td><td>${item.p_alamat || "-"}, RT ${item.p_rt || "-"} / RW ${item.p_rw || "-"}, Kel. ${item.p_desa || "-"}, Kec. ${item.p_kec || "-"}, ${item.p_kota || "-"}, Prov. ${item.p_prov || "-"} - ${item.p_kodepos || "-"}</td></tr>
                <tr><td>Kesehatan</td><td>GolDar: ${item.p_goldar || "-"} <br> Imunisasi: ${item.p_imunisasi || "-"} <br> Riwayat Sehat: ${item.p_sehat_khusus || "-"} <br> Alergi: ${item.p_alergi || "-"}</td></tr>
            </table>

            <div class="detail-section-title">👨 Identitas Ayah</div>
            <table class="detail-table">
                <tr><td>Nama Lengkap</td><td>${item.a_nama || "-"}</td></tr>
                <tr><td>NIK / Lahir</td><td>NIK: ${item.a_nik || "-"} <br> Lahir: ${item.a_tempat_lahir || "-"}, ${item.a_tanggal_lahir || "-"}</td></tr>
                <tr><td>Pendidikan / Kerja</td><td>${item.a_pendidikan || "-"} / ${item.a_pekerjaan || "-"}</td></tr>
                <tr><td>Penghasilan / HP</td><td>${item.a_penghasilan || "-"} / ${item.a_hp || "-"}</td></tr>
                <tr><td>Email</td><td>${item.a_email || "-"}</td></tr>
            </table>

            <div class="detail-section-title">👩 Identitas Ibu</div>
            <table class="detail-table">
                <tr><td>Nama Lengkap</td><td>${item.i_nama || "-"}</td></tr>
                <tr><td>NIK / Lahir</td><td>NIK: ${item.i_nik || "-"} <br> Lahir: ${item.i_tempat_lahir || "-"}, ${item.i_tanggal_lahir || "-"}</td></tr>
                <tr><td>Pendidikan / Kerja</td><td>${item.i_pendidikan || "-"} / ${item.i_pekerjaan || "-"}</td></tr>
                <tr><td>Penghasilan / HP</td><td>${item.i_penghasilan || "-"} / ${item.i_hp || "-"}</td></tr>
                <tr><td>Email</td><td>${item.i_email || "-"}</td></tr>
            </table>

            <div class="detail-section-title">📞 Kontak Darurat</div>
            <table class="detail-table">
                <tr><td>Nama Kontak</td><td>${item.d_nama || "-"} (${item.d_hubungan || "-"})</td></tr>
                <tr><td>No HP / Alamat</td><td>HP: ${item.d_hp || "-"} <br> Alamat: ${item.d_alamat || "-"}</td></tr>
            </table>
        `;

        modalDetailContent.innerHTML = detailsHtml;
        detailModal.classList.add("active");
    };

    const hideModal = () => detailModal.classList.remove("active");
    closeModal.addEventListener("click", hideModal);
    btnCloseModal.addEventListener("click", hideModal);

    // 8. DATA EXPORTER ENGINE (Convert Storage to Clean CSV Format)
    btnExport.addEventListener("click", () => {
        if (dataPendaftar.length === 0) {
            alert("Tidak ada data untuk diekspor!");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "No,Nama Anak,NIK Anak,Nama Ayah,Nama Ibu,No HP,Status\n";

        dataPendaftar.forEach((d, index) => {
            let row = `${index+1},${d.p_nama},'${d.p_nik},${d.a_nama},${d.i_nama},'${d.a_hp || d.i_hp},${d.status || 'Proses'}`;
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Data_PMB_SPS_Tunas_Melati_2026.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // 9. DATA MOCK INJECTOR (Untuk Simulasi Pengisian Tanpa Harus Mengisi Form Berkali-kali)
    btnInject.addEventListener("click", () => {
        const mockData = [
            {
                id: Date.now(),
                p_nama: "Andi Wijaya Kusuma", p_panggilan: "Andi", p_nik: "3402111205210001", p_kk: "3402111202150043",
                p_agama: "Islam", p_tempat_lahir: "Yogyakarta", p_tanggal_lahir: "2021-05-12", p_jk: "Laki-laki", p_warga: "Indonesia",
                p_anak_ke: 1, p_saudara: 1, p_status_keluarga: "Anak Kandung", p_alamat: "Dongkelan RT 04", p_rt: "04", p_rw: "01",
                p_desa: "Panggungharjo", p_kec: "Sewon", p_kota: "Bantul", p_prov: "Yogyakarta", p_kodepos: "55188", p_goldar: "O",
                p_imunisasi: "Lengkap (BCG, Polio, DPT)", p_sehat_khusus: "", p_alergi: "",
                a_nama: "Budi Kusuma", a_nik: "3402110203920002", a_tempat_lahir: "Bantul", a_tanggal_lahir: "1992-03-02",
                a_agama: "Islam", a_warga: "Indonesia", a_pendidikan: "S1", a_pekerjaan: "Karyawan Swasta", a_penghasilan: "Rp5.000.000 - Rp10.000.000",
                a_hp: "081234567890", a_email: "budi@email.com",
                i_nama: "Siti Rahmawati", i_nik: "3402114506940003", i_tempat_lahir: "Sleman", i_tanggal_lahir: "1994-06-15",
                i_agama: "Islam", i_warga: "Indonesia", i_pendidikan: "SMA", i_pekerjaan: "Ibu Rumah Tangga", i_penghasilan: "< Rp2.000.000",
                i_hp: "087765432109", i_email: "",
                d_nama: "Joko Supriyanto", d_hubungan: "Paman", d_hp: "089911223344", d_alamat: "Giwangan, Yogyakarta",
                status: "Proses"
            },
            {
                id: Date.now() + 1,
                p_nama: "Rara Kirana", p_panggilan: "Rara", p_nik: "3471024408210002", p_kk: "3471021204180012",
                p_agama: "Islam", p_tempat_lahir: "Yogyakarta", p_tanggal_lahir: "2021-08-04", p_jk: "Perempuan", p_warga: "Indonesia",
                p_anak_ke: 2, p_saudara: 2, p_status_keluarga: "Anak Kandung", p_alamat: "Jl. Malioboro No. 25", p_rt: "01", p_rw: "03",
                p_desa: "Sosromenduran", p_kec: "Gedongtengen", p_kota: "Yogyakarta", p_prov: "Yogyakarta", p_kodepos: "55271", p_goldar: "A",
                p_imunisasi: "BCG, Campak", p_sehat_khusus: "Alergi Dingin", p_alergi: "Udara Dingin",
                a_nama: "Hendra Wijaya", a_nik: "3471020202880001", a_tempat_lahir: "Yogyakarta", a_tanggal_lahir: "1988-02-02",
                a_agama: "Islam", a_warga: "Indonesia", a_pendidikan: "D3", a_pekerjaan: "Wiraswasta", a_penghasilan: "Rp2.000.000 - Rp5.000.000",
                a_hp: "085200112233", a_email: "hendra@email.com",
                i_nama: "Dewi Lestari", i_nik: "3471025211900004", i_tempat_lahir: "Kulon Progo", i_tanggal_lahir: "1990-11-12",
                i_agama: "Islam", i_warga: "Indonesia", i_pendidikan: "S1", i_pekerjaan: "Guru", i_penghasilan: "Rp2.000.000 - Rp5.000.000",
                i_hp: "081900223344", i_email: "dewi@email.com",
                d_nama: "Slamet", d_hubungan: "Kakek", d_hp: "081211223344", d_alamat: "Kraton, Yogyakarta",
                status: "Diterima"
            }
        ];

        dataPendaftar = [...dataPendaftar, ...mockData];
        localStorage.setItem(MAIN_STORAGE_KEY, JSON.stringify(dataPendaftar));
        loadDatabase();
        alert("2 Data Simulasi Anak Berhasil Di-inject ke Dashboard!");
    });

    // Run Initial Load
    loadDatabase();
});
