function verifyGateKey(key) {
    if (typeof key !== 'string' || key.length !== 6) {
        return false;
    }

    const TARGET_SEQUENCE = [91, 75, 87, 89, 101, 55];

    for (let i = 0; i < key.length; i++) {
        const transformed = key.charCodeAt(i) + (i * 3) + 7;
        if (transformed !== TARGET_SEQUENCE[i]) {
            return false;
        }
    }
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    const unlocked = parseInt(localStorage.getItem('ctf_level_unlocked') || '1', 10);
    document.querySelectorAll('.level-stepper .step-item').forEach((el, idx) => {
        if (idx + 1 < 4 || (idx + 1 <= unlocked && idx + 1 !== 4)) {
            el.classList.add('completed');
        }
    });

    const form = document.getElementById('reverse-form');
    const input = document.getElementById('pin-input');
    const submitBtn = document.getElementById('submit-btn');
    const feedbackMsg = document.getElementById('feedback-msg');
    const solvedCard = document.getElementById('solved-card');
    const hintToggleBtn = document.getElementById('hint-toggle-btn');
    const hintBox = document.getElementById('hint-box');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        feedbackMsg.className = 'feedback-msg';
        feedbackMsg.textContent = '';

        const submitted = input.value.trim();

        if (!submitted) {
            feedbackMsg.className = 'feedback-msg error';
            feedbackMsg.textContent = 'Silakan masukkan 6 karakter kunci.';
            return;
        }

        if (verifyGateKey(submitted)) {
            feedbackMsg.className = 'feedback-msg success';
            feedbackMsg.textContent = 'Checksum terverifikasi: Kunci memenuhi persamaan Gerbang 4!';

            setTimeout(() => {
                solvedCard.classList.remove('hidden');
                input.disabled = true;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Terverifikasi';

                const current = parseInt(localStorage.getItem('ctf_level_unlocked') || '1', 10);
                if (current <= 4) {
                    localStorage.setItem('ctf_level_unlocked', '5');
                }
            }, 350);
        } else {
            feedbackMsg.className = 'feedback-msg error';
            feedbackMsg.textContent = 'Verifikasi gagal: kunci tidak memenuhi target urutan persamaan.';
            input.focus();
        }
    });

    if (hintToggleBtn && hintBox) {
        hintToggleBtn.addEventListener('click', () => {
            hintBox.classList.toggle('hidden');
            hintToggleBtn.textContent = hintBox.classList.contains('hidden') ? 'Butuh petunjuk?' : 'Sembunyikan petunjuk';
        });
    }
});
