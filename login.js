// login.js
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
    const isPass = passwordInput.getAttribute("type") === "password";
    passwordInput.setAttribute("type", isPass ? "text" : "password");
    togglePassword.innerText = isPass ? "🙈" : "👁️";
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, document.getElementById("email").value, passwordInput.value);
        window.location.href = "admin.html";
    } catch (error) {
        alert("Kredensial salah. Akses ditolak.");
    }
});
