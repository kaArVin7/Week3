document.addEventListener('DOMContentLoaded', () => {
    const unlocked = parseInt(localStorage.getItem('ctf_level_unlocked') || '1', 10);
    document.querySelectorAll('.level-stepper .step-item').forEach((el, idx) => {
        if (idx + 1 < 5 || (idx + 1 <= unlocked && idx + 1 !== 5)) {
            el.classList.add('completed');
        }
    });

    function getRole() {
        const match = document.cookie.match(new RegExp('(^|;\\s*)role=([^;]*)'));
        const cookieRole = match ? decodeURIComponent(match[2]) : '';
        return cookieRole || sessionStorage.getItem('role') || '';
    }

    if (!sessionStorage.getItem('access_tier')) {
        sessionStorage.setItem('access_tier', 'guest');
    }
    if (!getRole()) {
        try { document.cookie = "role=intern; path=/"; } catch (_) {}
        sessionStorage.setItem('role', 'intern');
    }

    const evalBtn = document.getElementById('eval-btn');
    const feedbackMsg = document.getElementById('feedback-msg');
    const victoryVault = document.getElementById('victory-vault');
    const sessionBadge = document.getElementById('session-badge');
    const tierDisplay = document.getElementById('tier-display');
    const cookieDisplay = document.getElementById('cookie-display');
    const hintToggleBtn = document.getElementById('hint-toggle-btn');
    const hintBox = document.getElementById('hint-box');
    const resetBtn = document.getElementById('reset-btn');

    function refreshDisplays() {
        const tier = sessionStorage.getItem('access_tier') || 'undefined';
        const role = getRole() || 'undefined';
        if (tierDisplay) tierDisplay.textContent = `sessionStorage('access_tier'): "${tier}"`;
        if (cookieDisplay) cookieDisplay.textContent = `session/cookie('role'): "${role}"`;
    }

    refreshDisplays();

    evalBtn.addEventListener('click', () => {
        refreshDisplays();
        const tier = (sessionStorage.getItem('access_tier') || '').trim();
        const role = getRole().trim();

        feedbackMsg.className = 'feedback-msg';
        feedbackMsg.textContent = '';

        if (tier === 'root_executive' && role === 'superadmin') {
            feedbackMsg.className = 'feedback-msg success';
            feedbackMsg.textContent = 'Izin terverifikasi: Mode Godmode Eksekutif berhasil diperoleh!';

            if (sessionBadge) {
                sessionBadge.className = 'tier-badge success';
                sessionBadge.textContent = 'AKSES: ROOT_EXECUTIVE // SUPERADMIN';
            }

            setTimeout(() => {
                victoryVault.classList.remove('hidden');
                evalBtn.disabled = true;
                evalBtn.textContent = 'Izin Diterima';
                localStorage.setItem('ctf_level_unlocked', '5');
            }, 350);
        } else {
            feedbackMsg.className = 'feedback-msg error';
            feedbackMsg.textContent = `Izin Ditolak: tier='${tier}' (harus 'root_executive') & role='${role}' (harus 'superadmin').`;
            if (sessionBadge) {
                sessionBadge.className = 'tier-badge danger';
                sessionBadge.textContent = 'SESI: AKSES DIBATASI';
            }
        }
    });

    if (hintToggleBtn && hintBox) {
        hintToggleBtn.addEventListener('click', () => {
            hintBox.classList.toggle('hidden');
            hintToggleBtn.textContent = hintBox.classList.contains('hidden') ? 'Butuh petunjuk?' : 'Sembunyikan petunjuk';
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            localStorage.removeItem('ctf_level_unlocked');
            sessionStorage.removeItem('access_tier');
            sessionStorage.removeItem('role');
            document.cookie = "role=; max-age=0; path=/";
            window.location.href = 'level1.html';
        });
    }
});
