/**
 * SISTEM PENERIMAAN MURID BARU (SPMB) - SPS TUNAS MELATI
 * CORE ENGINE JAVASCRIPT ARCHITECTURE (VANILLA JS - EXTENDED MODULAR)
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // Object Mappings DOM
    const form = document.getElementById("spmbForm");
    const inputs = form.querySelectorAll("input, select, textarea");
    const addressTextArea = document.getElementById("p_alamat");
    const addressCounter = document.getElementById("alamat-counter");
    const progressBar = document.getElementById("progressBar");
    const progressPercent = document.getElementById("progress-percent");
    const mainHeader = document.getElementById("mainHeader");
    const backToTopBtn = document.getElementById("backToTop");
    
    // Theme & Utility Mappings
    const themeBtn = document.getElementById("btn-theme");
    const resetBtn = document.getElementById("btn-reset-form");
    
    // Modal Preview Mappings
    const previewModal = document.getElementById("previewModal");
    const previewContent = document.getElementById("previewContent");
    const closeModalBtn = document.getElementById("closeModal");
    const btnEditBack = document.getElementById("btnEditBack");
    const btnPrintForm = document.getElementById("btnPrintForm");
    const btnFinalSubmit = document.getElementById("btnFinalSubmit");
    const submitSpinner = document.getElementById("submitSpinner");

    const STORAGE_KEY = "spmb_tunas_melati_draft";
    const THEME_KEY = "spmb_theme";

    /* ==========================================================================
       1. AUTOMATIC REAL-TIME AUTO-CAPITALIZATION & MASKING KEY FILTERS
       ========================================================================== */
    const initCharacterFilters = () => {
        inputs.forEach(input => {
            if (input.type === "text" || input.tagName === "TEXTAREA") {
                input.addEventListener("input", (e) => {
                    // Auto Capitalize First Letter of Every Word
                    let cursorPosition = e.target.selectionStart;
                    let val = e.target.value;
                    let capitalized = val.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
                    
                    if (val !== capitalized) {
                        e.target.value = capitalized;
                        e.target.setSelectionRange(cursorPosition, cursorPosition);
                    }
                });
            }

            // Real-time Filtering Key Constraints based on HTML5 Data attributes
            if (input.dataset.validate === "numeric" || input.dataset.validate === "numeric-exact") {
                input.addEventListener("keypress", (e) => {
                    if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                    }
                });
                input.addEventListener("input", (e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                });
            }
        });
        
        // Character Counter for Address Field
        if (addressTextArea && addressCounter) {
            addressTextArea.addEventListener("input", () => {
                addressCounter.textContent = `${addressTextArea.value.length} karakter`;
            });
        }
    };

    /* ==========================================================================
       2. REAL-TIME REGEX VALIDATION CORE ENGINE
       ========================================================================== */
    const validateField = (field) => {
        if (!field.hasAttribute("required") && field.value.trim() === "") {
            setValidationStatus(field, true);
            return true;
        }

        let isValid = true;
        let errorMessage = "";
        const val = field.value.trim();
        const type = field.dataset.validate;

        // Base Check Required Empty Fields
        if (field.hasAttribute("required") && val === "") {
            isValid = false;
            errorMessage = "Field ini wajib diisi.";
        } else if (val !== "") {
            // Complex Custom Regex Specifications Check Rules
            if (type === "nama") {
                if (val.length < 3) {
                    isValid = false;
                    errorMessage = "Nama minimal berisikan 3 karakter.";
                } else if (!/^[a-zA-Z\s.`]+$/.test(val)) {
                    isValid = false;
                    errorMessage = "Nama hanya boleh menggunakan huruf.";
                }
            } else if (type === "numeric-exact") {
                const targetLen = parseInt(field.dataset.len);
                if (val.length !== targetLen) {
                    isValid = false;
                    errorMessage = `Harus berisikan tepat ${targetLen} digit angka. (Sekarang: ${val.length} digit)`;
                }
            } else if (type === "email") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(val)) {
                    isValid = false;
                    errorMessage = "Format penulisan email tidak valid.";
                }
            }
        }

        setValidationStatus(field, isValid, errorMessage);
        return isValid;
    };

    const setValidationStatus = (field, isValid, msg = "") => {
        const group = field.closest(".form-group");
        if (!group) return;

        const errSpan = group.querySelector(".error-msg");

        if (isValid) {
            group.classList.remove("error");
            group.classList.add("success");
            if (errSpan) errSpan.textContent = "";
        } else {
            group.classList.remove("success");
            group.classList.add("error");
            if (errSpan) errSpan.textContent = msg;
        }
    };

    const runGlobalValidationHandlers = () => {
        inputs.forEach(input => {
            input.addEventListener("blur", () => {
                validateField(input);
                calculateFormProgress();
            });
            input.addEventListener("change", () => {
                validateField(input);
                calculateFormProgress();
                saveDraftToLocalStorage();
            });
            input.addEventListener("input", () => {
                // Remove error state quickly when parent clears it
                if(input.value.trim() !== "") {
                    calculateFormProgress();
                    saveDraftToLocalStorage();
                }
            });
        });
    };

    /* ==========================================================================
       3. MATHEMATICAL FORM PROGRESS BAR ALGORITHM
       ========================================================================== */
    const calculateFormProgress = () => {
        // Only count standard required fields to generate reliable percentage 
        const requiredInputs = Array.from(inputs).filter(input => input.hasAttribute("required"));
        const filledFields = requiredInputs.filter(input => {
            const group = input.closest(".form-group");
            return input.value.trim() !== "" && (group ? !group.classList.contains("error") : true);
        });

        const percent = requiredInputs.length ? Math.round((filledFields.length / requiredInputs.length) * 100) : 0;
        
        progressBar.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
    };

    /* ==========================================================================
       4. LOCALSTORAGE ENGINE: AUTO-SAVE & STATE RESTORE
       ========================================================================== */
    const saveDraftToLocalStorage = () => {
        const formData = {};
        inputs.forEach(input => {
            formData[input.id] = input.value;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    };

    const restoreDraftData = () => {
        const rawDraft = localStorage.getItem(STORAGE_KEY);
        if (!rawDraft) return;

        try {
            const data = JSON.parse(rawDraft);
            inputs.forEach(input => {
                if (data[input.id] !== undefined) {
                    input.value = data[input.id];
                }
            });
            calculateFormProgress();
            if (addressTextArea) {
                addressCounter.textContent = `${addressTextArea.value.length} karakter`;
            }
        } catch (e) {
            console.error("Gagal memuat data draf pendaftaran.", e);
        }
    };

    /* ==========================================================================
       5. ADVANCED SYSTEM INTERFACES & UI/UX INTERACTIONS
       ========================================================================== */
    
    // Keyboard Friendly Navigation: Enter key focuses next input elements
    form.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.type !== "submit") {
            e.preventDefault();
            const formElements = Array.from(inputs).filter(el => !el.disabled && el.type !== "hidden");
            const index = formElements.indexOf(e.target);
            if (index > -1 && index + 1 < formElements.length) {
                formElements[index + 1].focus();
            }
        }
    });

    // Theme Switch Mechanism Control
    const initThemeEngine = () => {
        const currentTheme = localStorage.getItem(THEME_KEY) || "light";
        document.documentElement.setAttribute("data-theme", currentTheme);
        themeBtn.textContent = currentTheme === "dark" ? "☀️ Mode Terang" : "🌙 Mode Gelap";

        themeBtn.addEventListener("click", () => {
            let theme = document.documentElement.getAttribute("data-theme");
            let newTheme = theme === "dark" ? "light" : "dark";
            
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem(THEME_KEY, newTheme);
            themeBtn.textContent = newTheme === "dark" ? "☀️ Mode Terang" : "🌙 Mode Gelap";
            showToast("Tema visual berhasil diubah!", "info");
        });
    };

    // Form Hard Reset Handler
    resetBtn.addEventListener("click", () => {
        if (confirm("Apakah Anda yakin ingin menghapus seluruh isian formulir? Data draf akan hilang.")) {
            form.reset();
            localStorage.removeItem(STORAGE_KEY);
            inputs.forEach(input => {
                const group = input.closest(".form-group");
                if(group) group.classList.remove("error", "success");
            });
            calculateFormProgress();
            window.scrollTo({ top: 0, behavior: "smooth" });
            showToast("Formulir pendaftaran berhasil di-reset.", "info");
        }
    });

    // Material Ripple Dynamic Tap Effects Setup
    const initRippleEffects = () => {
        const buttons = document.querySelectorAll(".btn-submit, .btn-utility, .btn");
        buttons.forEach(btn => {
            btn.addEventListener("click", function(e) {
                let x = e.clientX - e.target.getBoundingClientRect().left;
                let y = e.clientY - e.target.getBoundingClientRect().top;
                let ripple = document.createElement("span");
                ripple.classList.add("ripple");
                ripple.style.left = x + "px";
                ripple.style.top = y + "px";
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    };

    // Sticky Compressor Header & Back To Top Element System Tracker
    window.addEventListener("scroll", () => {
        if (window.scrollY > 120) {
            mainHeader.classList.add("sticky");
            backToTopBtn.style.display = "block";
        } else {
            mainHeader.classList.remove("sticky");
            backToTopBtn.style.display = "none";
        }
    });

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Scroll Reveal Engine Animation Setup
    const initScrollReveal = () => {
        const cards = document.querySelectorAll(".scroll-reveal");
        const revealCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        };
        const observer = new IntersectionObserver(revealCallback, { threshold: 0.05 });
        cards.forEach(card => observer.observe(card));
    };

    /* ==========================================================================
       6. SYSTEM NOTIFICATIONS (TOAST ARCHITECTURE)
       ========================================================================== */
    const showToast = (message, type = "success") => {
        const container = document.getElementById("toastContainer");
        const toast = document.createElement("div");
        toast.classList.add("toast", type);
        toast.innerHTML = `<span>${message}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => toast.classList.add("show"), 100);

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    };

    /* ==========================================================================
       7. INTERACTIVE DATA PREVIEW MODAL & GENERATE RENDERING ENGINE
       ========================================================================== */
    const buildHTMLDataPreview = () => {
        const sections = [
            { title: "👶 Identitas Calon Peserta Didik", prefix: "p_" },
            { title: "👨 Identitas Ayah Kandung", prefix: "a_" },
            { title: "👩 Identitas Ibu Kandung", prefix: "i_" },
            { title: "📞 Kontak Darurat & Korespondensi", prefix: "d_" }
        ];

        let htmlStructure = "";

        sections.forEach(sec => {
            htmlStructure += `<div class="preview-section-title">${sec.title}</div>`;
            htmlStructure += `<table class="preview-table"><tbody>`;
            
            inputs.forEach(input => {
                if (input.id.startsWith(sec.prefix)) {
                    // Extract descriptive clear text label
                    let labelText = form.querySelector(`label[for="${input.id}"]`)?.textContent || input.id;
                    labelText = labelText.replace("*", "").trim();
                    const valText = input.value.trim() || "-";
                    
                    // Do not print optional empty technical data
                    if (!(input.id.endsWith("imunisasi") || input.id.endsWith("khusus") || input.id.endsWith("alergi") || input.id.endsWith("email")) || input.value !== "") {
                        htmlStructure += `<tr><td>${labelText}</td><td>${valText}</td></tr>`;
                    }
                }
            });
            
            htmlStructure += `</tbody></table>`;
        });

        previewContent.innerHTML = htmlStructure;
    };

    /* ==========================================================================
       8. SUBMIT PIPELINE MANAGEMENT CORE EXECUTION
       ========================================================================== */
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        let formHasErrors = false;
        let initialFocusElement = null;

        // Perform final verification run throughout all standard system components
        inputs.forEach(input => {
            if (!validateField(input)) {
                formHasErrors = true;
                if (!initialFocusElement) initialFocusElement = input;
            }
        });

        if (formHasErrors) {
            showToast("Gagal memproses. Harap periksa kembali baris pesan error formulir.", "info");
            if (initialFocusElement) initialFocusElement.focus();
            return;
        }

        // Generate data payload matrix structure representation and launch preview screen modal
        buildHTMLDataPreview();
        previewModal.classList.add("active");
    });

    // Close Modal Interfaces Commands
    const hidePreviewModal = () => previewModal.classList.remove("active");
    closeModalBtn.addEventListener("click", hidePreviewModal);
    btnEditBack.addEventListener("click", hidePreviewModal);

    // Native Hardware Printer Pipeline Direct Link API
    btnPrintForm.addEventListener("click", () => {
        window.print();
    });

    // Final Core Submit Simulated Execution Interface
    btnFinalSubmit.addEventListener("click", () => {
        hidePreviewModal();
        window.scrollTo({ top: 0, behavior: "smooth" });
        
        // UI Application Processing Lockout Sequence
        submitSpinner.style.display = "inline-block";
        document.getElementById("btnSubmit").style.pointerEvents = "none";
        document.getElementById("btnSubmit").style.opacity = "0.7";

        // Simulated asynchronous API payload dispatch server timing frame
        setTimeout(() => {
            submitSpinner.style.display = "none";
            document.getElementById("btnSubmit").style.pointerEvents = "auto";
            document.getElementById("btnSubmit").style.opacity = "1";
            
            // Purge local infrastructure cache stores upon success verification
            localStorage.removeItem(STORAGE_KEY);
            form.reset();
            calculateFormProgress();
            
            alert("Selamat! Data Formulir Pendaftaran Murid Baru SPS Tunas Melati Berhasil Dikirim dan Tersimpan di Sistem Database.");
            showToast("Pendaftaran online berhasil diproses!", "success");
        }, 2500);
    });

    /* ==========================================================================
       INITIALIZATION PIPELINE INITIAL ENGINE ACTIVATION
       ========================================================================== */
    initCharacterFilters();
    runGlobalValidationHandlers();
    initThemeEngine();
    restoreDraftData();
    initRippleEffects();
    initScrollReveal();
});
