import { db, generateNomorPendaftaran } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("spmbForm");
    const inputs = form.querySelectorAll("input, select, textarea");
    const toast = document.getElementById("toast");
    const backToTop = document.getElementById("backToTop");

    // --- LOGIC ACCORDION (BUKA TUTUP CARD) ---
    const cardToggles = document.querySelectorAll(".card-header-toggle");
    
    cardToggles.forEach((toggle, index) => {
        const card = toggle.closest(".glass-card");
        
        // Card pertama (index 0) langsung dibuka otomatis di awal
        if (index === 0) {
            card.classList.add("active");
        }

        // Event listener klik untuk buka/tutup card
        toggle.addEventListener("click", () => {
            card.classList.toggle("active");
        });
    });

    // Save data draft ketikan ke local storage
    inputs.forEach(input => {
        input.addEventListener("input", () => {
            if (input.id) {
                localStorage.setItem(`draft_${input.id}`, input.value);
            }
        });
    });

    // Load Data Draft jika Halaman Ter-refresh
    function loadDraft() {
        inputs.forEach(input => {
            if (input.id) {
                const saved = localStorage.getItem(`draft_${input.id}`);
                if (saved) input.value = saved;
            }
        });
    }
    loadDraft();

    function showToast(msg) {
        if (toast) {
            toast.innerText = msg;
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 4000);
        }
    }

    // Scroll To Top Logic
    window.addEventListener("scroll", () => {
        if (backToTop) {
            if (window.scrollY > 300) backToTop.classList.add("show");
            else backToTop.classList.remove("show");
        }
    });
    
    if (backToTop) {
        backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // ACTION INTEGRASI DATABASE FIRESTORE
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const regNo = await generateNomorPendaftaran();
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

            await addDoc(collection(db, "pendaftaran"), payload);
            alert(`Pendaftaran Berhasil Terkirim!\nNomor Registrasi: ${regNo}`);
            
            // Wipe Out Local Cache Draft
            inputs.forEach(i => {
                if (i.id) localStorage.removeItem(`draft_${i.id}`);
            });
            form.reset();
            
            // Tutup semua card setelah sukses submit, kembalikan hanya seksi pertama yang aktif
            document.querySelectorAll(".glass-card").forEach((c, idx) => {
                if (idx === 0) c.classList.add("active");
                else c.classList.remove("active");
            });
        } catch (err) {
            console.error(err);
            showToast("Akses Cloud Terputus. Gagal menyimpan.");
        }
    });
});
