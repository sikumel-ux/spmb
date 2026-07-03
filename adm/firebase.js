// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Konfigurasi Resmi SPS Tunas Melati Dongkelan
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
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Fungsi Otomatis Generator Nomor Pendaftaran
 * Format Output: SPMB-2026-0001, SPMB-2026-0002, dst.
 */
export async function generateNomorPendaftaran() {
    try {
        const q = query(collection(db, "pendaftaran"), orderBy("createdAt", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        let nextNum = 1;
        
        if (!querySnapshot.empty) {
            const lastDoc = querySnapshot.docs[0].data();
            if (lastDoc.nomorPendaftaran) {
                // Memotong string 'SPMB-2026-0001' -> diambil '0001'
                const parts = lastDoc.nomorPendaftaran.split('-');
                if (parts.length === 3) {
                    const lastNumStr = parts[2];
                    nextNum = parseInt(lastNumStr, 10) + 1;
                }
            }
        }
        
        // Return string terformat dengan padding 4 digit angka
        return `SPMB-2026-${String(nextNum).padStart(4, '0')}`;
    } catch (error) {
        console.error("Error generating nomor pendaftaran: ", error);
        // Fallback random jika query gagal agar aplikasi tidak crash saat submit
        return `SPMB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }
}
