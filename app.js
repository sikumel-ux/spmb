import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Konfigurasi Project Firebase milikmu, bro
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

// Fungsi Pemicu Custom Alert Modal
function tampilkanAlert(tipe, judul, pesan) {
    const overlay = document.getElementById("customAlert");
    const iconBox = document.getElementById("alertIcon");
    const titleBox = document.getElementById("alertTitle");
    const msgBox = document.getElementById("alertMessage");
    const btnClose = document.getElementById("alertBtnClose");

    titleBox.innerText = judul;
    msgBox.innerText = pesan;

    if (tipe === "success") {
        iconBox.innerText = "🎉";
        btnClose.className = "btn-alert-close btn-success-theme";
    } else {
        iconBox.innerText = "❌";
        btnClose.className = "btn-alert-close";
    }

    overlay.classList.add("active");

    // Kembalikan promise agar bisa ditunggu aksinya saat user klik selesai
    return new Promise((resolve) => {
        btnClose.onclick = () => {
            overlay.classList.remove("active");
            resolve();
        };
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("mainPendaftaranForm");
    const trackFields = document.querySelectorAll(".track-field");
    const progressBar = document.getElementById("progressBar");
    const percentText = document.getElementById("percentText");

    function updateFormProgress() {
        let filledCount = 0;
        trackFields.forEach(field => {
            if (field.value.trim() !== "") {
                filledCount++;
            }
        });
        const totalFields = trackFields.length;
        const currentPercentage = Math.round((filledCount / totalFields) * 100);
        progressBar.style.width = currentPercentage + "%";
        percentText.innerText = currentPercentage + "%";
    }

    trackFields.forEach(field => {
        field.addEventListener("input", updateFormProgress);
        field.addEventListener("change", updateFormProgress);
    });

    updateFormProgress();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = "⏳ Menyimpan ke Server Cloud...";

        const selectedJk = document.querySelector('input[name="p_jk"]:checked').value;
        const namaAnak = document.getElementById("p_nama").value.trim();

        const record = {
            createdAt: serverTimestamp(),
            status: "Proses",
            
            p_nama: namaAnak,
            p_panggilan: document.getElementById("p_panggilan").value.trim(),
            p_jk: selectedJk,
            p_nik: document.getElementById("p_nik").value.trim(),
            p_kk: document.getElementById("p_kk").value.trim(),
            p_tempat_lahir: document.getElementById("p_tempat_lahir").value.trim(),
            p_tanggal_lahir: document.getElementById("p_tanggal_lahir").value,
            p_agama: document.getElementById("p_agama").value,
            p_anak_ke: parseInt(document.getElementById("p_anak_ke").value) || 1,
            p_saudara: parseInt(document.getElementById("p_saudara").value) || 1,
            p_alamat: document.getElementById("p_alamat").value.trim(),
            p_rt: document.getElementById("p_rt").value.trim(),
            p_rw: document.getElementById("p_rw").value.trim(),
            p_desa: document.getElementById("p_desa").value.trim(),
            p_kec: document.getElementById("p_kec").value.trim(),
            p_kota: document.getElementById("p_kota").value.trim(),
            p_goldar: document.getElementById("p_goldar").value || "Tidak Tahu",
            p_imunisasi: document.getElementById("p_imunisasi").value.trim() || "-",

            a_nama: document.getElementById("a_nama").value.trim(),
            a_nik: document.getElementById("a_nik").value.trim(),
            a_hp: document.getElementById("a_hp").value.trim(),
            a_pekerjaan: document.getElementById("a_pekerjaan").value.trim(),
            a_penghasilan: document.getElementById("a_penghasilan").value,

            i_nama: document.getElementById("i_nama").value.trim(),
            i_nik: document.getElementById("i_nik").value.trim(),
            i_hp: document.getElementById("i_hp").value.trim() || document.getElementById("a_hp").value.trim(),
            i_pekerjaan: document.getElementById("i_pejaan").value.trim(),
            i_penghasilan: document.getElementById("i_penghasilan").value
        };

        try {
            await addDoc(collection(db, "pendaftar"), record);
            
            // Trigger Custom Alert Sukses
            await tampilkanAlert(
                "success", 
                "Pendaftaran Berhasil!", 
                `Data calon siswa atas nama "${namaAnak}" telah aman disimpan ke database server cloud SPS Tunas Melati.`
            );
            
            form.reset();
            updateFormProgress();
        } catch (error) {
            console.error("Error adding document: ", error);
            await tampilkanAlert(
                "error", 
                "Gagal Menyimpan", 
                "Waduh bro, data gagal dikirim ke cloud. Pastikan internet aktif dan rule Firestore di-set Public/Test Mode."
            );
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "🚀 Kirim Formulir Sekarang";
        }
    });
});
