document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("mainPendaftaranForm");
    const trackFields = document.querySelectorAll(".track-field");
    const progressBar = document.getElementById("progressBar");
    const percentText = document.getElementById("percentText");
    const DB_KEY = "spmb_tunas_melati_submitted_data";

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
        
        // Push hasil kalkulasi ke UI
        progressBar.style.width = currentPercentage + "%";
        percentText.innerText = currentPercentage + "%";
    }

    // Pasang listener di semua jenis field form
    trackFields.forEach(field => {
        field.addEventListener("input", updateFormProgress);
        field.addEventListener("change", updateFormProgress);
    });

    // Jalankan pengecekan pertama kali saat halaman dibuka
    updateFormProgress();

    // Proses Simpan Data Form
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const selectedJk = document.querySelector('input[name="p_jk"]:checked').value;

        const record = {
            id: Date.now(),
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
            p_anak_ke: document.getElementById("p_anak_ke").value,
            p_saudara: document.getElementById("p_saudara").value,
            p_alamat: document.getElementById("p_alamat").value.trim(),
            p_rt: document.getElementById("p_rt").value.trim(),
            p_rw: document.getElementById("p_rw").value.trim(),
            p_desa: document.getElementById("p_desa").value.trim(),
            p_kec: document.getElementById("p_kec").value.trim(),
            p_kota: document.getElementById("p_kota").value.trim(),
            p_goldar: document.getElementById("p_goldar").value,
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

        let currentDb = [];
        const existingData = localStorage.getItem(DB_KEY);
        if (existingData) {
            try { currentDb = JSON.parse(existingData); } catch(err) { currentDb = []; }
        }

        currentDb.unshift(record);
        localStorage.setItem(DB_KEY, JSON.stringify(currentDb));

        alert(`🎉 Berhasil!\nData pendaftaran atas nama "${record.p_nama}" sukses masuk ke database admin.`);
        form.reset();
        updateFormProgress(); 
    });
});
