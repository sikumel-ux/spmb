import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔑 Konfigurasi Firebase Resmi Milikmu (Project: tnsmelatidkl)
const firebaseConfig = {
  apiKey: "AIzaSyA1zxBRXwKGwj7Tz3Rcy3vWTtu9aQNKY84",
  authDomain: "tnsmelatidkl.firebaseapp.com",
  projectId: "tnsmelatidkl",
  storageBucket: "tnsmelatidkl.firebasestorage.app",
  messagingSenderId: "915178991722",
  appId: "1:915178991722:web:b465200ab481a5939e9a13"
};

// Inisialisasi Firebase & DB Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🎲 Fungsi Pembuat Nomor Pendaftaran Unik Otomatis
function generateNomorPendaftaran() {
    const date = new Date();
    const tahun = date.getFullYear().toString().substring(2); // Ambil 2 angka belakang (cth: 26)
    const bulan = String(date.getMonth() + 1).padStart(2, '0'); // Ambil bulan (01-12)
    const randomHex = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // 4 angka acak
    return `SPMB-${tahun}${bulan}-${randomHex}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("spmbForm");
    const inputs = form.querySelectorAll("input, select, textarea");
    const toast = document.getElementById("toast");
    const btnSubmit = document.getElementById("btnSubmit");
    const backToTop = document.getElementById("backToTop");

    // 💾 SISTEM AUTO-SAVE DRAFT (Local Storage)
    inputs.forEach(input => {
        if (input.id) {
            // Muat data jika sebelumnya sudah pernah mengetik tapi ter-refresh
            const saved = localStorage.getItem(`draft_${input.id}`);
            if (saved) input.value = saved;
            
            // Simpan setiap kali ada perubahan ketikan
            input.addEventListener("input", () => {
                localStorage.setItem(`draft_${input.id}`, input.value);
            });
        }
    });

    // 📢 Fungsi Memunculkan Notifikasi Toast (Sukses / Gagal)
    function triggerNotification(message, type = "success") {
        if (!toast) return;
        toast.innerText = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove("show"), 4000);
    }

    // 🔝 Tombol Scroll To Top Kontroler
    window.addEventListener("scroll", () => {
        if (backToTop) {
            if (window.scrollY > 300) backToTop.classList.add("show");
            else backToTop.classList.remove("show");
        }
    });
    if (backToTop) {
        backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // 🚀 PROSES KIRIM DATA (SUBMIT FORM TO FIREBASE)
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Kunci tombol agar tidak di-klik ganda oleh pendaftar
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Memproses...";

        try {
            const regNo = generateNomorPendaftaran();
            
            // Bungkus seluruh data formulir ke dalam satu paket (Payload)
            const payload = {
                nomorPendaftaran: regNo,
                status: "Pending",
                createdAt: serverTimestamp(),
                anak: {
                    namaLengkap: document.getElementById("namaAnak").value,
                    namaPanggilan: document.getElementById("namaPanggilan").value,
                    nik: document.getElementById("nikAnak").value,
                    noKk: document.getElementById("noKk").value,
                    tempatLahir: document.getElementById("tempatLahir").value,
                    tanggalLahir: document.getElementById("tanggalLahir").value,
                    jenisKelamin: document.getElementById("jenisKelamin").value,
                    agama: document.getElementById("agamaAnak").value,
                    warga: document.getElementById("wargaAnak").value,
                    anakKe: document.getElementById("anakKe").value,
                    jumlahSaudara: document.getElementById("jumlahSaudara").value,
                    statusKeluarga: document.getElementById("statusKeluarga").value,
                    alamat: document.getElementById("alamat").value,
                    rt: document.getElementById("rt").value,
                    rw: document.getElementById("rw").value,
                    desa: document.getElementById("desa").value,
                    kecamatan: document.getElementById("kecamatan").value,
                    kabupaten: document.getElementById("kabupaten").value,
                    provinsi: document.getElementById("provinsi").value,
                    kodePos: document.getElementById("kodePos").value,
                    golDarah: document.getElementById("golDarah").value,
                    imunisasi: document.getElementById("imunisasi").value,
                    kondisiKesehatan: document.getElementById("kondisiKesehatan").value,
                    alergi: document.getElementById("alergi").value
                },
                ayah: {
                    nama: document.getElementById("namaAyah").value,
                    nik: document.getElementById("nikAyah").value,
                    ttl: document.getElementById("ttlAyah").value,
                    agama: document.getElementById("agamaAyah").value,
                    warga: document.getElementById("wargaAyah").value,
                    pendidikan: document.getElementById("pendidikanAyah").value,
                    pekerjaan: document.getElementById("pekerjaanAyah").value,
                    gaji: document.getElementById("gajiAyah").value,
                    hp: document.getElementById("hpAyah").value,
                    email: document.getElementById("emailAyah").value
                },
                ibu: {
                    nama: document.getElementById("namaIbu").value,
                    nik: document.getElementById("nikIbu").value,
                    ttl: document.getElementById("ttlIbu").value,
                    agama: document.getElementById("agamaIbu").value,
                    warga: document.getElementById("wargaIbu").value,
                    pendidikan: document.getElementById("pendidikanIbu").value,
                    pekerjaan: document.getElementById("pekerjaanIbu").value,
                    gaji: document.getElementById("gajiIbu").value,
                    hp: document.getElementById("hpIbu").value,
                    email: document.getElementById("emailIbu").value
                },
                darurat: {
                    nama: document.getElementById("namaDarurat").value,
                    hubungan: document.getElementById("hubunganDarurat").value,
                    hp: document.getElementById("hpDarurat").value,
                    alamat: document.getElementById("alamatDarurat").value
                }
            };

            // Tembak data langsung ke Cloud Firestore ke dalam koleksi bernama 'pendaftaran'
            await addDoc(collection(db, "pendaftaran"), payload);
            
            // Simpan nomor pendaftaran sementara di memori browser agar bisa dibaca halaman Terimakasih
            sessionStorage.setItem("latestRegNo", regNo);

            // Munculkan notifikasi sukses (Toast hijau di kanan atas)
            triggerNotification("Berkas Pendaftaran Berhasil Terkirim ke Cloud!", "success");

            // Bersihkan seluruh data draft ketikan di local storage karena data sudah aman terkirim
            inputs.forEach(i => { if (i.id) localStorage.removeItem(`draft_${i.id}`); });
            form.reset();

            // Beri jeda 2 detik (2000 ms) agar pendaftar sempat melihat notifikasi sukses, lalu lempar ke halaman Terimakasih
            setTimeout(() => {
                window.location.href = "terimakasih.html";
            }, 2000);

        } catch (err) {
            // LOG ERROR KE CONSOLE BROWSER (F12)
            console.error("Firebase Database Error: ", err);
            
            // 🚨 POPUP DIAGNOSIS OTOMATIS: Menampilkan detail eror sesungguhnya di layar browser
            alert("Gagal Kirim Data! Alasan Sistem:\n" + err.message);
            triggerNotification("Gagal menyimpan data: " + err.message, "error");
            
            // Kembalikan tombol ke keadaan semula agar pendaftar bisa mencoba klik kirim lagi
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Kirim Berkas";
        }
    });
});
