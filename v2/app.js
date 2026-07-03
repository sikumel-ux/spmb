// app.js
import { db, generateNomorPendaftaran } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("spmbForm");
    const inputs = form.querySelectorAll("input, select, textarea");
    const progressBarFill = document.getElementById("progressBarFill");
    const progressText = document.getElementById("progressText");
    const toast = document.getElementById("toast");
    const backToTop = document.getElementById("backToTop");

    // --- 1. REALTIME VALIDATION & PROGRESS TRACKER ---
    function updateProgress() {
        const requiredInputs = Array.from(inputs).filter(i => i.hasAttribute('required'));
        const filledRequired = requiredInputs.filter(i => i.value.trim() !== "").length;
        const percentage = Math.round((filledRequired / requiredInputs.length) * 100);
        
        progressBarFill.style.width = `${percentage}%`;
        progressText.innerText = `${percentage}%`;
    }

    inputs.forEach(input => {
        input.addEventListener("input", () => {
            updateProgress();
            // Auto Save Draft LocalStorage
            localStorage.setItem(`draft_${input.id}`, input.value);
        });
    });

    // Load Draft Data
    function loadDraft() {
        inputs.forEach(input => {
            const savedValue = localStorage.getItem(`draft_${input.id}`);
            if (savedValue) {
                input.value = savedValue;
            }
        });
        updateProgress();
    }
    loadDraft();

    // --- 2. FLOATING TOAST HELPER ---
    function showToast(message) {
        toast.innerText = message;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 4000);
    }

    // --- 3. DARK MODE TOGGLE ---
    document.getElementById("themeToggle").addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const targetTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", targetTheme);
    });

    // --- 4. SCROLL & BACK TO TOP ---
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) backToTop.classList.add("show");
        else backToTop.classList.remove("show");
    });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // --- 5. MODAL PREVIEW ENGINE ---
    document.getElementById("btnPreview").addEventListener("click", () => {
        let content = "<strong>Identitas Calon Siswa:</strong><br>";
        content += `Nama: ${document.getElementById("namaAnak").value || '-'}<br>`;
        content += `NIK: ${document.getElementById("nikAnak").value || '-'}<br>`;
        content += `Orang Tua: Ayah ${document.getElementById("namaAyah").value || '-'} / Ibu ${document.getElementById("namaIbu").value || '-'}`;
        
        document.getElementById("previewContent").innerHTML = content;
        document.getElementById("previewModal").style.display = "flex";
    });

    document.getElementById("closePreview").addEventListener("click", () => {
        document.getElementById("previewModal").style.display = "none";
    });

    document.getElementById("btnPrintForm").addEventListener("click", () => {
        window.print();
    });

    // --- 6. FIRESTORE SUBMISSION ---
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        try {
            const nomorReg = await generateNomorPendaftaran();
            
            const payload = {
                nomorPendaftaran: nomorReg,
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
                    alamat: document.getElementById("alamat").value,
                    rt: document.getElementById("rt").value,
                    rw: document.getElementById("rw").value
                },
                ayah: {
                    nama: document.getElementById("namaAyah").value,
                    hp: document.getElementById("hpAyah").value
                },
                ibu: {
                    nama: document.getElementById("namaIbu").value,
                    hp: document.getElementById("hpIbu").value
                }
            };

            await addDoc(collection(db, "pendaftaran"), payload);
            showToast(`Pendaftaran Berhasil! Nomor Pendaftaran Anda: ${nomorReg}`);
            
            // Clear Storage & Form
            inputs.forEach(input => localStorage.removeItem(`draft_${input.id}`));
            form.reset();
            updateProgress();
            
        } catch (error) {
            console.error(error);
            showToast("Gagal mengirim berkas, Silakan periksa koneksi.");
        }
    });
});
