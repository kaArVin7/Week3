document.addEventListener('DOMContentLoaded', () => {
    const unlocked = parseInt(localStorage.getItem('ctf_level_unlocked') || '1', 10);
    document.querySelectorAll('.level-stepper .step-item').forEach((el, idx) => {
        if (idx + 1 < 2 || (idx + 1 <= unlocked && idx + 1 !== 2)) {
            el.classList.add('completed');
        }
    });

    const form = document.getElementById('crypto-form');
    const input = document.getElementById('flag-input');
    const submitBtn = document.getElementById('submit-btn');
    const feedbackMsg = document.getElementById('feedback-msg');
    const solvedCard = document.getElementById('solved-card');
    const hintToggleBtn = document.getElementById('hint-toggle-btn');
    const hintBox = document.getElementById('hint-box');

    function rot13(str) {
        return str.replace(/[a-zA-Z]/g, function(c) {
            var base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base);
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        feedbackMsg.className = 'feedback-msg';
        feedbackMsg.textContent = '';

        const submitted = input.value.trim();

        if (!submitted) {
            feedbackMsg.className = 'feedback-msg error';
            feedbackMsg.textContent = 'Silakan masukkan flag hasil dekripsi.';
            return;
        }

        if (rot13(submitted) === 'SYNT{y2_ebg13_pvcure_qrpbqrq}') {
            feedbackMsg.className = 'feedback-msg success';
            feedbackMsg.textContent = 'Dekripsi terverifikasi: Muatan satelit berhasil dipecahkan!';

            setTimeout(() => {
                solvedCard.classList.remove('hidden');
                input.disabled = true;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Terpecahkan';

                const current = parseInt(localStorage.getItem('ctf_level_unlocked') || '1', 10);
                if (current <= 2) {
                    localStorage.setItem('ctf_level_unlocked', '3');
                }
            }, 350);
        } else {
            feedbackMsg.className = 'feedback-msg error';
            feedbackMsg.textContent = 'Dekripsi gagal: nilai flag tidak valid.';
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
