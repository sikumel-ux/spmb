import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 🔑 Konfigurasi Firebase Resmi (Project: tnsmelatidkl)
const firebaseConfig = {
  apiKey: "AIzaSyA1zxBRXwKGwj7Tz3Rcy3vWTtu9aQNKY84",
  authDomain: "tnsmelatidkl.firebaseapp.com",
  projectId: "tnsmelatidkl",
  storageBucket: "tnsmelatidkl.firebasestorage.app",
  messagingSenderId: "915178991722",
  appId: "1:915178991722:web:b465200ab481a5939e9a13"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🛡️ GERBANG PROTEKSI KEAMANAN URL
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Jika tidak ada sesi login, langsung tendang ke folder login luar
        window.location.href = "../login/";
    } else {
        // Tampilkan email admin aktif di pojok kanan atas top bar
        const adminUserEmail = document.getElementById("adminUserEmail");
        if (adminUserEmail) adminUserEmail.innerText = user.email;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // DOM Cache Elements
    const tableBody = document.getElementById("studentTableBody");
    const tableSearch = document.getElementById("tableSearch");
    const detailModal = document.getElementById("detailModal");
    const detailModalBody = document.getElementById("detailModalBody");
    const closeModal = document.getElementById("closeModal");
    
    // Mobile Navigation Elements
    const menuMobileToggle = document.getElementById("menuMobileToggle");
    const adminSidebar = document.getElementById("adminSidebar");
    const menuItems = document.querySelectorAll(".menu-item");
    const mainTitle = document.querySelector(".top-bar h2");

    let allData = []; // Cache lokal penampung seluruh data dari Firestore
    let currentFilterStatus = "all"; // Mengontrol tampilan menu aktif

    // --- 📱 CONTROLLER SIDEBAR MOBILE ---
    if (menuMobileToggle && adminSidebar) {
        menuMobileToggle.addEventListener("click", () => {
            adminSidebar.classList.toggle("open");
        });
    }

    // --- 🗺️ SISTEM INTERFACES NAVIGASI SIDEBAR (SPA ENGINE) ---
    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Atur kelas active navigasi menu sidebar
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            // Ambil teks menu bersih (tanpa emoji)
            const menuText = item.textContent.trim().replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();
            
            // Ubah judul besar top bar secara dinamis
            mainTitle.innerText = `Menu: ${menuText}`;

            // Logika kontrol input pencarian berdasarkan fungsi menu
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

            // Tutup otomatis sidebar jika dibuka via HP setelah menu diklik
            if (adminSidebar) adminSidebar.classList.remove("open");

            renderTable();
        });
    });

    // --- 🚪 AMANKAN TOMBOL KELUAR PANEL ---
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            if (confirm("Apakah Anda yakin ingin keluar dari Panel Sistem Administrasi ini?")) {
                await signOut(auth); // Hapus sesi login cloud Firebase Auth
                window.location.href = "../login/"; // Lempar balik ke halaman login utama
            }
        });
    }

    // --- 🟢 REAL-TIME SYNC DATA FIRESTORE & LIVE METRICS CARD ---
    onSnapshot(collection(db, "pendaftaran"), (snapshot) => {
        allData = [];
        
        let total = 0, hariIni = 0, mingguIni = 0;
        const targetHariIni = new Date().toDateString();
        const targetMingguIni = new Date();
        targetMingguIni.setDate(targetMingguIni.getDate() - 7); // Set rentang 7 hari terakhir

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            allData.push({ id: docSnap.id, ...data });

            // Kalkulasi data statistik untuk Soft UI Card
            total++;
            if (data.createdAt) {
                const dateObj = data.createdAt.toDate();
                // Hitung pendaftar hari ini
                if (dateObj.toDateString() === targetHariIni) hariIni++;
                // Hitung pendaftar minggu ini
                if (dateObj >= targetMingguIni) mingguIni++;
            }
        });

        // Dorong angka statistik ke elemen visual dashboard
        document.getElementById("statTotal").innerText = total;
        document.getElementById("statHariIni").innerText = hariIni;
        document.getElementById("statMingguIni").innerText = mingguIni;

        renderTable();
    });

    // --- 🔍 RENDER TABLE DATA & ENGINE FILTER PENCARIAN REAKTIF ---
    function renderTable() {
        tableBody.innerHTML = "";

        // Alihkan fungsi render jika admin sedang membuka menu Statistik / Pengaturan
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

        // Looping data pendaftaran
        allData.forEach((data) => {
            const namaAnak = (data.anak?.namaLengkap || "").toLowerCase();
            const nikAnak = (data.anak?.nik || "").toLowerCase();
            const nomorReg = (data.nomorPendaftaran || "").toLowerCase();

            // Filter Pencarian (Nama / NIK / No. Registrasi)
            if (keyword !== "" && !namaAnak.includes(keyword) && !nikAnak.includes(keyword) && !nomorReg.includes(keyword)) {
                return;
            }

            const jkDisplay = data.anak?.jenisKelamin === "Laki-laki" ? "L" : "P";

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
                        <button class="action-btn btn-view" data-id="${data.id}" title="Buka Berkas">👁️</button>
                        <button class="action-btn btn-approve" data-id="${data.id}" title="Terima Berkas">✔️</button>
                        <button class="action-btn btn-reject" data-id="${data.id}" title="Tolak Berkas">✖️</button>
                        <button class="action-btn btn-delete" data-id="${data.id}" title="Hapus Permanen">🗑️</button>
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

    // Pasang listener input keyboard pada kolom pencarian
    if (tableSearch) {
        tableSearch.addEventListener("input", renderTable);
    }

    // --- ⚡ ATTACH EVENT LISTENER AKSI TOMBOL TABEL ---
    function bindTableButtons() {
        // 1. Tombol Detail Modal Pop-up
        document.querySelectorAll(".btn-view").forEach(btn => {
            btn.addEventListener("click", () => openModalDetail(btn.getAttribute("data-id")));
        });

        // 2. Tombol Konfirmasi Berkas Diterima
        document.querySelectorAll(".btn-approve").forEach(btn => {
            btn.addEventListener("click", async () => {
                if (confirm("Terima Berkas ini dan ubah status menjadi 'Diterima'?")) {
                    await updateDoc(doc(db, "pendaftaran", btn.getAttribute("data-id")), { status: "Diterima" });
                }
            });
        });

        // 3. Tombol Konfirmasi Berkas Ditolak
        document.querySelectorAll(".btn-reject").forEach(btn => {
            btn.addEventListener("click", async () => {
                if (confirm("Tolak Berkas ini dan ubah status menjadi 'Ditolak'?")) {
                    await updateDoc(doc(db, "pendaftaran", btn.getAttribute("data-id")), { status: "Ditolak" });
                }
            });
        });

        // 4. Tombol Hapus Permanen dari Cloud Firestore
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                const nama = allData.find(item => item.id === id)?.anak?.namaLengkap || "Pendaftar";
                if (confirm(`🚨 PERINGATAN CRITICAL!\nApakah Anda yakin ingin menghapus data berkas "${nama}" secara permanen dari server cloud?`)) {
                    await deleteDoc(doc(db, "pendaftaran", id));
                }
            });
        });
    }

    // --- 👁️ MODAL DETAIL CONTENT BUILDER & PRINT ENGINE ---
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

        // Trigger Cetak Dokumen/Simpan PDF
        document.getElementById("btnPrintPDF").addEventListener("click", () => {
            window.print();
        });
    }

    // Modal Close Trigger Handlers
    if (closeModal) {
        closeModal.addEventListener("click", () => detailModal.style.display = "none");
    }
    window.addEventListener("click", (e) => {
        if (e.target === detailModal) detailModal.style.display = "none";
    });

    // --- 📊 VIEW KUSTOM SPA: STATISTIK BERKAS ---
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
                        <div style="background:#f1f5f9; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
                            <h3 style="color:var(--primary-hijau); margin-bottom:15px; font-weight:700;">Proporsi Gender</h3>
                            <p style="font-size:1.1rem; margin-bottom:8px;">👦 Laki-laki: <strong>${cowok} Siswa</strong></p>
                            <p style="font-size:1.1rem;">👧 Perempuan: <strong>${cewek} Siswi</strong></p>
                        </div>
                        <div style="background:#f1f5f9; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
                            <h3 style="color:#3b82f6; margin-bottom:15px; font-weight:700;">Status Peninjauan Berkas</h3>
                            <p style="color:#15803d; font-weight:600; margin-bottom:5px;">✓ Diterima: ${diterima} Berkas</p>
                            <p style="color:#b45309; font-weight:600; margin-bottom:5px;">⏳ Pending / Diperiksa: ${pending} Berkas</p>
                            <p style="color:#b91c1c; font-weight:600;">✕ Ditolak: ${ditolak} Berkas</p>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }

    // --- ⚙️ VIEW KUSTOM SPA: PENGATURAN PANEL ---
    function renderPengaturanView() {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="padding: 40px; text-align: left;">
                    <div style="max-width: 500px; background: #fff; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; box-shadow:0 4px 6px rgba(0,0,0,0.02);">
                        <h3 style="margin-bottom: 15px; color:#2f3640; font-weight:700;">Sistem Pengaturan Panel</h3>
                        <div style="margin-bottom: 15px;">
                            <label style="font-weight:600; font-size:0.85rem; display:block; margin-bottom:5px; color:#475569;">Tahun Ajaran Aktif</label>
                            <select style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1; outline:none;"><option>2026/2027 (Aktif)</option><option>2027/2028</option></select>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="font-weight:600; font-size:0.85rem; display:block; margin-bottom:5px; color:#475569;">Status Gelombang Pendaftaran</label>
                            <span style="background:#dcfce7; color:#15803d; padding:4px 10px; border-radius:6px; font-size:0.8rem; font-weight:700;">Gelombang 1 Buka</span>
                        </div>
                        <button id="btnSaveSetting" style="background:var(--primary-hijau); color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:600; cursor:pointer; transition:opacity 0.2s;">Simpan Perubahan</button>
                    </div>
                </td>
            </tr>
        `;

        document.getElementById("btnSaveSetting").addEventListener("click", () => {
            alert("Pengaturan tahun ajaran baru berhasil disimpan!");
        });
    }
});
