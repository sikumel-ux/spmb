// 1. Import Firebase SDK versi Modular via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. Konfigurasi Firebase milikmu
const firebaseConfig = {
    apiKey: "AIzaSyA1zxBRXwKGwj7Tz3Rcy3vWTtu9aQNKY84",
    authDomain: "tnsmelatidkl.firebaseapp.com",
    projectId: "tnsmelatidkl",
    storageBucket: "tnsmelatidkl.firebasestorage.app",
    messagingSenderId: "915178991722",
    appId: "1:915178991722:web:b465200ab481a5939e9a13"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("mainPendaftaranForm");
    const trackFields = document.querySelectorAll(".track-field");
    const progressBar = document.getElementById("progressBar");
    const percentText = document.getElementById("percentText");

    // Engine Realtime Perhitungan Progress Bar
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

    // Proses Simpan Data Ke Firebase Firestore
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = "⏳ Menyimpan ke Server...";

        const selectedJk = document.querySelector('input[name="p_jk"]:checked').value;

        // Struktur Payload Data
        const record = {
            createdAt: serverTimestamp(),
            status: "Proses",
            
            // Data Anak
            p_nama: document.getElementById("p_nama").value.trim(),
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

            // Data Ayah
            a_nama: document.getElementById("a_nama").value.trim(),
            a_nik: document.getElementById("a_nik").value.trim(),
            a_hp: document.getElementById("a_hp").value.trim(),
            a_pekerjaan: document.getElementById("a_pekerjaan").value.trim(),
            a_penghasilan: document.getElementById("a_penghasilan").value,

            // Data Ibu
            i_nama: document.getElementById("i_nama").value.trim(),
            i_nik: document.getElementById("i_nik").value.trim(),
            i_hp: document.getElementById("i_hp").value.trim() || document.getElementById("a_hp").value.trim(),
            i_pekerjaan: document.getElementById("i_pejaan").value.trim(),
            i_penghasilan: document.getElementById("i_penghasilan").value
        };

        try {
            // Menyimpan ke collection bernama 'pendaftar'
            await addDoc(collection(db, "pendaftar"), record);
            
            alert(`🎉 Sukses!\nData pendaftaran "${record.p_nama}" berhasil disimpan ke Firebase Cloud Database.`);
            form.reset();
            updateFormProgress();
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Gagal menyimpan data ke server cloud. Pastikan Firestore rules Anda sudah diset ke test mode/public.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "🚀 Kirim Formulir Sekarang";
        }
    });
});
