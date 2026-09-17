document.addEventListener('DOMContentLoaded', () => {
    const unlocked = parseInt(localStorage.getItem('ctf_level_unlocked') || '1', 10);
    document.querySelectorAll('.level-stepper .step-item').forEach((el, idx) => {
        if (idx + 1 < 1 || (idx + 1 <= unlocked && idx + 1 !== 1)) {
            el.classList.add('completed');
        }
    });

    const form = document.getElementById('bypass-form');
    const keyInput = document.getElementById('override-key');
    const roleInput = document.getElementById('auth-role');
    const submitBtn = document.getElementById('submit-btn');
    const feedbackMsg = document.getElementById('feedback-msg');
    const solvedCard = document.getElementById('solved-card');
    const hintToggleBtn = document.getElementById('hint-toggle-btn');
    const hintBox = document.getElementById('hint-box');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        feedbackMsg.className = 'feedback-msg';
        feedbackMsg.textContent = '';

        const key = keyInput.value.trim();
        const role = (roleInput ? roleInput.value : '').trim().toLowerCase();

        if (submitBtn.hasAttribute('disabled')) {
            feedbackMsg.className = 'feedback-msg error';
            feedbackMsg.textContent = 'Pengiriman dikunci oleh keamanan sistem.';
            return;
        }

        if (role !== 'admin') {
            feedbackMsg.className = 'feedback-msg error';
            feedbackMsg.textContent = `Akses ditolak: role saat ini '${role || 'tidak diketahui'}'. Diperlukan eskalasi ke 'admin'.`;
            return;
        }

        if (key !== 'FLAG{l1_client_side_bypass_pwned}') {
            feedbackMsg.className = 'feedback-msg error';
            feedbackMsg.textContent = 'Akses ditolak: kunci darurat teknisi salah.';
            return;
        }

        feedbackMsg.className = 'feedback-msg success';
        feedbackMsg.textContent = 'Otorisasi terverifikasi. Gerbang Keamanan 1 berhasil dilewati.';

        setTimeout(() => {
            solvedCard.classList.remove('hidden');
            keyInput.disabled = true;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Terbuka';

            const current = parseInt(localStorage.getItem('ctf_level_unlocked') || '1', 10);
            if (current <= 1) {
                localStorage.setItem('ctf_level_unlocked', '2');
            }
        }, 350);
    });

    if (hintToggleBtn && hintBox) {
        hintToggleBtn.addEventListener('click', () => {
            hintBox.classList.toggle('hidden');
            hintToggleBtn.textContent = hintBox.classList.contains('hidden') ? 'Butuh petunjuk?' : 'Sembunyikan petunjuk';
        });
    }
});
