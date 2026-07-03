import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Kunci Konfigurasi Firebase Resmi Milikmu
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

// Fungsi Generate Manual Nomor Pendaftaran Unik
function generateNomorPendaftaran() {
    const date = new Date();
    const tahun = date.getFullYear().toString().substring(2);
    const bulan = String(date.getMonth() + 1).padStart(2, '0');
    const randomHex = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SPMB-${tahun}${bulan}-${randomHex}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("spmbForm");
    const inputs = form.querySelectorAll("input, select, textarea");
    const toast = document.getElementById("toast");
    const btnSubmit = document.getElementById("btnSubmit");
    const backToTop = document.getElementById("backToTop");

    // Load data draft otomatis jika ada data tersimpan
    inputs.forEach(input => {
        if (input.id) {
            const saved = localStorage.getItem(`draft_${input.id}`);
            if (saved) input.value = saved;
            
            input.addEventListener("input", () => {
                localStorage.setItem(`draft_${input.id}`, input.value);
            });
        }
    });

    // Fungsi trigger Notifikasi Pintar (Sukses / Gagal)
    function triggerNotification(message, type = "success") {
        if (!toast) return;
        toast.innerText = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove("show"), 4000);
    }

    // Scroll To Top Controller
    window.addEventListener("scroll", () => {
        if (backToTop) {
            if (window.scrollY > 300) backToTop.classList.add("show");
            else backToTop.classList.remove("show");
        }
    });
    if (backToTop) {
        backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // HANDLER KIRIM DATA KE FIREBASE
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Ubah tombol jadi status loading proteksi klik ganda
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Memproses...";

        try {
            const regNo = generateNomorPendaftaran();
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

            // Kirim Dokumen ke Koleksi 'pendaftaran' di Firestore milikmu
            await addDoc(collection(db, "pendaftaran"), payload);
            
            // Simpan nomor pendaftaran sementara di sessionStorage untuk dibaca halaman Terimakasih
            sessionStorage.setItem("latestRegNo", regNo);

            // Munculkan Notif Sukses Hijau
            triggerNotification("Berkas Pendaftaran Berhasil Terkirim ke Cloud!", "success");

            // Hapus cache ketikan local draft
            inputs.forEach(i => { if (i.id) localStorage.removeItem(`draft_${i.id}`); });
            form.reset();

            // Beri jeda 2 detik untuk mata membaca notif, lalu bawa ke halaman Terimakasih
            setTimeout(() => {
                window.location.href = "terimakasih.html";
            }, 2000);

        } catch (err) {
            console.error("Firebase Database Error: ", err);
            triggerNotification("Akses Cloud Gagal! Cek koneksi internet Anda.", "error");
            
            // Kembalikan tombol ke sedia kala agar user bisa coba kirim ulang
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Kirim Berkas";
        }
    });
});
