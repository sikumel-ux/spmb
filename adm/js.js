import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔑 Konfigurasi Firebase Resmi Milikmu (Project: tnsmelatidkl)
const firebaseConfig = {
  apiKey: "AIzaSyA1zxBRXwKGwj7Tz3Rcy3vWTtu9aQNKY84",
  authDomain: "tnsmelatidkl.firebaseapp.com",
  projectId: "tnsmelatidkl",
  storageBucket: "tnsmelatidkl.firebasestorage.app",
  messagingSenderId: "915178991722",
  appId: "1:915178991722:web:b465200ab481a5939e9a13"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const tableBody = document.getElementById("studentTableBody");
    const tableSearch = document.getElementById("tableSearch");
    const detailModal = document.getElementById("detailModal");
    const detailModalBody = document.getElementById("detailModalBody");
    const closeModal = document.getElementById("closeModal");
    const adminUserEmail = document.getElementById("adminUserEmail");
    
    // Mobile Navigation Elements
    const menuMobileToggle = document.getElementById("menuMobileToggle");
    const adminSidebar = document.getElementById("adminSidebar");
    const menuItems = document.querySelectorAll(".menu-item");
    const mainTitle = document.querySelector(".top-bar h2");

    // Set default admin email name
    if (adminUserEmail) adminUserEmail.innerText = "admin@tunasmela.ti";

    let allData = []; // Cache lokal untuk menampung seluruh data pendaftaran
    let currentFilterStatus = "all"; // Mengontrol tab menu aktif ('all', 'Dashboard', dll)

    // --- 📱 CONTROLLER MOBILE MENU ---
    if (menuMobileToggle && adminSidebar) {
        menuMobileToggle.addEventListener("click", () => {
            adminSidebar.classList.toggle("open");
        });
    }

    // --- 🗺️ SISTEM NAVIGASI SIDEBAR (SPA ENGINE) ---
    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Ubah kelas active di sidebar
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            // Ambil nama menu yang diklik
            const menuText = item.textContent.trim().replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();
            
            // Ubah Title Dashboard secara dinamis sesuai menu
            mainTitle.innerText = `Menu: ${menuText}`;

            // Logika filter data berdasarkan menu yang dipilih
            if (menuText === "Dashboard" || menuText === "Data Murid") {
                currentFilterStatus = "all";
                tableSearch.style.display = "block";
            } else if (menuText === "Pencarian") {
                currentFilterStatus = "all";
                tableSearch.style.display = "block";
                tableSearch.focus();
            } else if (menuText === "Statistik Berkas") {
                currentFilterStatus = "Statistik";
                tableSearch.style.display = "none";
            } else if (menuText === "Pengaturan") {
                currentFilterStatus = "Pengaturan";
                tableSearch.style.display = "none";
            }

            // Tutup sidebar jika di mobile setelah klik menu
            if (adminSidebar) adminSidebar.classList.remove("open");

            renderTable();
        });
    });

    // --- 🚪 TOMBOL LOGOUT PANEL ---
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            if (confirm("Apakah Anda yakin ingin keluar dari Panel Sistem Administrasi ini?")) {
                window.location.href = "index.html"; // Balik ke halaman form depan
            }
        });
    }

    // --- 🟢 REAL-TIME LISTENER FIREBASE DATA & STATS ---
    onSnapshot(collection(db, "pendaftaran"), (snapshot) => {
        allData = [];
        
        let total = 0, hariIni = 0, mingguIni = 0;
        const targetHariIni = new Date().toDateString();
        const targetMingguIni = new Date();
        targetMingguIni.setDate(targetMingguIni.getDate() - 7); // Batas 7 hari ke belakang

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            allData.push({ id: docSnap.id, ...data });

            // Hitung statistik numerik
            total++;
            if (data.createdAt) {
                const dateObj = data.createdAt.toDate();
                // Hari ini
                if (dateObj.toDateString() === targetHariIni) hariIni++;
                // Minggu ini (7 hari terakhir)
                if (dateObj >= targetMingguIni) mingguIni++;
            }
        });

        // Tampilkan ke Card Ringkasan Soft UI
        document.getElementById("statTotal").innerText = total;
        document.getElementById("statHariIni").innerText = hariIni;
        document.getElementById("statMingguIni").innerText = mingguIni;

        renderTable();
    });

    // --- 🔍 PROSES FILTER REAL-TIME RENDER TABEL ---
    function renderTable() {
        tableBody.innerHTML = "";

        // Validasi menu custom seperti Statistik atau Pengaturan
        if (currentFilterStatus === "Statistik") {
            renderStatistikView();
            return;
        }
        if (currentFilterStatus === "Pengaturan") {
            renderPengaturanView();
            return;
        }

        const keyword = tableSearch.value.toLowerCase().trim();
        let indexNumber = 1;

        // Jalankan perulangan data murid
        allData.forEach((data) => {
            const namaAnak = (data.anak?.namaLengkap || "").toLowerCase();
            const nikAnak = (data.anak?.nik || "").toLowerCase();
            const nomorReg = (data.nomorPendaftaran || "").toLowerCase();

            // Filter Pencarian kata kunci (Nama, NIK, atau No Registrasi)
            if (keyword !== "" && !namaAnak.includes(keyword) && !nikAnak.includes(keyword) && !nomorReg.includes(keyword)) {
                return;
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${indexNumber++}</td>
                <td style="font-weight:700; color:#2f3542;">${data.nomorPendaftaran || '-'}</td>
                <td><strong style="color:#2f3640;">${data.anak?.namaLengkap || '-'}</strong></td>
                <td>${data.anak?.nik || '-'}</td>
                <td>${data.ayah?.nama || '-'}</td>
                <td>${data.ibu?.nama || '-'}</td>
                <td><span class="status-badge ${data.status || 'Pending'}">${data.status || 'Pending'}</span></td>
                <td style="text-align: center;">
                    <div class="action-btn-group">
                        <button class="action-btn btn-view" data-id="${data.id}">👁️</button>
                        <button class="action-btn btn-approve" data-id="${data.id}">✔️</button>
                        <button class="action-btn btn-reject" data-id="${data.id}">✖️</button>
                        <button class="action-btn btn-delete" data-id="${data.id}">🗑️</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        if (tableBody.innerHTML === "") {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #718093; padding:20px;">Tidak ditemukan berkas murid pendaftar.</td></tr>`;
        }

        bindTableButtons();
    }

    // --- ⌨️ EVENT INPUT PENCARIAN REAKTIF ---
    if (tableSearch) {
        tableSearch.addEventListener("input", renderTable);
    }

    // --- ⚡ ATTACH EVENT LISTENER TOMBOL DINAMIS ---
    function bindTableButtons() {
        // Tombol Detail Modal
        document.querySelectorAll(".btn-view").forEach(btn => {
            btn.addEventListener("click", () => openModalDetail(btn.getAttribute("data-id")));
        });

        // Tombol Konfirmasi Berkas Diterima
        document.querySelectorAll(".btn-approve").forEach(btn => {
            btn.addEventListener("click", async () => {
                if (confirm("Terima Berkas ini dan ubah status menjadi 'Diterima'?")) {
                    await updateDoc(doc(db, "pendaftaran", btn.getAttribute("data-id")), { status: "Diterima" });
                }
            });
        });

        // Tombol Konfirmasi Berkas Ditolak
        document.querySelectorAll(".btn-reject").forEach(btn => {
            btn.addEventListener("click", async () => {
                if (confirm("Tolak Berkas ini dan ubah status menjadi 'Ditolak'?")) {
                    await updateDoc(doc(db, "pendaftaran", btn.getAttribute("data-id")), { status: "Ditolak" });
                }
            });
        });

        // Tombol Hapus Permanen
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async () => {
                if (confirm("🚨 PERINGATAN!\nHapus data pendaftar ini secara permanen dari server cloud?")) {
                    await deleteDoc(doc(db, "pendaftaran", btn.getAttribute("data-id")));
                }
            });
        });
    }

    // --- 👁️ MODAL DETAIL CONTENT BUILDER ---
    function openModalDetail(id) {
        const data = allData.find(item => item.id === id);
        if (!data) return;

        detailModalBody.innerHTML = `
            <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
                <button id="btnPrintPDF" class="action-btn" style="background:#8b5cf6; color:white; padding:8px 16px; border-radius:8px; font-weight:600;">🖨️ Cetak / Unduh PDF Resmi</button>
            </div>
            <div class="modal-section-box">
                <h4>I. Biodata Calon Siswa</h4>
                <div class="info-grid">
                    <div><span>Nama Lengkap:</span> ${data.anak?.namaLengkap || '-'}</div>
                    <div><span>Nama Panggilan:</span> ${data.anak?.namaPanggilan || '-'}</div>
                    <div><span>NIK:</span> ${data.anak?.nik || '-'}</div>
                    <div><span>No. Kartu Keluarga:</span> ${data.anak?.noKk || '-'}</div>
                    <div><span>Tempat, Tgl Lahir:</span> ${data.anak?.tempatLahir || '-'}, ${data.anak?.tanggalLahir || '-'}</div>
                    <div><span>Jenis Kelamin:</span> ${data.anak?.jenisKelamin || '-'}</div>
                    <div><span>Agama:</span> ${data.anak?.agama || '-'}</div>
                    <div><span>Anak Ke / Sdr:</span> ${data.anak?.anakKe || '-'} dari ${data.anak?.jumlahSaudara || '-'} bersaudara</div>
                    <div style="grid-column: span 2;"><span>Alamat Rumah:</span> ${data.anak?.alamat || '-'} RT ${data.anak?.rt || '-'}/RW ${data.anak?.rw || '-'}, Ds. ${data.anak?.desa || '-'}, Kec. ${data.anak?.kecamatan || '-'}</div>
                </div>
            </div>
            <div class="modal-section-box">
                <h4>II. Data Orang Tua / Wali</h4>
                <div class="info-grid">
                    <div><span>Nama Ayah:</span> ${data.ayah?.nama || '-'}</div>
                    <div><span>No. HP/WA Ayah:</span> ${data.ayah?.hp || '-'}</div>
                    <div><span>Pekerjaan Ayah:</span> ${data.ayah?.pekerjaan || '-'}</div>
                    <div><span>Nama Ibu:</span> ${data.ibu?.nama || '-'}</div>
                    <div><span>No. HP/WA Ibu:</span> ${data.ibu?.hp || '-'}</div>
                    <div><span>Pekerjaan Ibu:</span> ${data.ibu?.pekerjaan || '-'}</div>
                </div>
            </div>
            <div class="modal-section-box">
                <h4>III. Kontak Keadaan Darurat</h4>
                <div class="info-grid">
                    <div><span>Nama Kontak:</span> ${data.darurat?.nama || '-'}</div>
                    <div><span>Hubungan Keluarga:</span> ${data.darurat?.hubungan || '-'}</div>
                    <div><span>Nomor HP/WA:</span> ${data.darurat?.hp || '-'}</div>
                </div>
            </div>
        `;

        detailModal.style.display = "flex";

        // Pasang Trigger Cetak PDF di dalam Modal
        document.getElementById("btnPrintPDF").addEventListener("click", () => {
            window.print();
        });
    }

    // Modal Close Triggers
    if (closeModal) {
        closeModal.addEventListener("click", () => detailModal.style.display = "none");
    }
    window.addEventListener("click", (e) => {
        if (e.target === detailModal) detailModal.style.display = "none";
    });

    // --- 📊 VIEW KUSTOM: STATISTIK BERKAS ---
    function renderStatistikView() {
        let cowok = allData.filter(d => d.anak?.jenisKelamin === "Laki-laki").length;
        let cewek = allData.filter(d => d.anak?.jenisKelamin === "Perempuan").length;
        let diterima = allData.filter(d => d.status === "Diterima").length;
        let pending = allData.filter(d => d.status === "Pending" || !d.status).length;
        let ditolak = allData.filter(d => d.status === "Ditolak").length;

        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="padding: 30px;">
                    <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:20px; text-align: left;">
                        <div style="background:#f1f5f9; padding:20px; border-radius:12px;">
                            <h3 style="color:var(--primary-hijau); margin-bottom:15px;">Proporsi Gender</h3>
                            <p style="font-size:1.1rem; margin-bottom:8px;">👦 Laki-laki: <strong>${cowok} Siswa</strong></p>
                            <p style="font-size:1.1rem;">👧 Perempuan: <strong>${cewek} Siswi</strong></p>
                        </div>
                        <div style="background:#f1f5f9; padding:20px; border-radius:12px;">
                            <h3 style="color:#3b82f6; margin-bottom:15px;">Status Peninjauan Berkas</h3>
                            <p style="color:#15803d; font-weight:600; margin-bottom:5px;">✓ Diterima: ${diterima} Berkas</p>
                            <p style="color:#b45309; font-weight:600; margin-bottom:5px;">⏳ Pending / Diperiksa: ${pending} Berkas</p>
                            <p style="color:#b91c1c; font-weight:600;">✕ Ditolak: ${ditolak} Berkas</p>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }

    // --- ⚙️ VIEW KUSTOM: PENGATURAN ---
    function renderPengaturanView() {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="padding: 40px; text-align: left;">
                    <div style="max-width: 500px; background: #fff; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px;">
                        <h3 style="margin-bottom: 15px; color:#2f3640;">Sistem Pengaturan Panel</h3>
                        <div style="margin-bottom: 15px;">
                            <label style="font-weight:600; font-size:0.85rem; display:block; margin-bottom:5px;">Tahun Ajaran Aktif</label>
                            <select style="width:100%; padding:10px; border-radius:8px; border:1px solid #ccc;"><option>2026/2027 (Aktif)</option><option>2027/2028</option></select>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="font-weight:600; font-size:0.85rem; display:block; margin-bottom:5px;">Status Gelombang Pendaftaran</label>
                            <span style="background:#dcfce7; color:#15803d; padding:4px 10px; border-radius:6px; font-size:0.8rem; font-weight:700;">Gelombang 1 Buka</span>
                        </div>
                        <button onclick="alert('Pengaturan tahun ajaran berhasil disimpan!')" style="background:var(--primary-hijau); color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:600; cursor:pointer;">Simpan Perubahan</button>
                    </div>
                </td>
            </tr>
        `;
    }
});
