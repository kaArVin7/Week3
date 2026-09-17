(function () {
    'use strict';

    const BGM_SRC = 'assets/bgm.mp3';
    const FALLBACK_BGM = 'assets/fallback.mp3';
    const STICKER_SRC = 'assets/wlee.gif';

    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';

    let savedVol = parseFloat(localStorage.getItem('bgm_volume') || '0.5');
    audio.volume = isNaN(savedVol) ? 0.5 : Math.max(0, Math.min(1, savedVol));

    let isFallback = sessionStorage.getItem('bgm_is_fallback') === 'true';

    if (isFallback) {
        audio.src = FALLBACK_BGM;
    } else {
        audio.src = BGM_SRC;
    }

    audio.addEventListener('error', function fallbackHandler() {
        if (audio.src !== FALLBACK_BGM) {
            audio.src = FALLBACK_BGM;
            sessionStorage.setItem('bgm_is_fallback', 'true');
            isFallback = true;
            showFallbackSticker();
            audio.removeEventListener('error', fallbackHandler);
            if (sessionStorage.getItem('bgm_playing') !== 'false') {
                tryPlay();
            }
        }
    });

    let savedTime = parseFloat(sessionStorage.getItem('bgm_time') || '0');

    audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && savedTime >= audio.duration - 0.5) {
            savedTime = 0;
            audio.currentTime = 0;
            sessionStorage.setItem('bgm_time', '0');
        } else if (!isNaN(savedTime) && savedTime > 0) {
            audio.currentTime = savedTime;
        }
    });

    if (!isNaN(savedTime) && savedTime > 0) {
        audio.currentTime = savedTime;
    }

    audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        sessionStorage.setItem('bgm_time', '0');
        audio.play().catch(err => console.warn('[BGM Loop Error]', err));
    });

    audio.addEventListener('timeupdate', () => {
        if (!audio.paused) {
            if (audio.duration && audio.currentTime >= audio.duration - 0.3) {
                sessionStorage.setItem('bgm_time', '0');
            } else {
                sessionStorage.setItem('bgm_time', audio.currentTime.toString());
            }
        }
    });

    window.addEventListener('beforeunload', () => {
        if (audio.duration && audio.currentTime >= audio.duration - 0.3) {
            sessionStorage.setItem('bgm_time', '0');
        } else {
            sessionStorage.setItem('bgm_time', audio.currentTime.toString());
        }
        sessionStorage.setItem('bgm_playing', (!audio.paused).toString());
    });

    function showFallbackSticker() {
        if (document.getElementById('bgm-fallback-sticker')) return;

        if (!document.getElementById('bgm-sticker-style')) {
            const style = document.createElement('style');
            style.id = 'bgm-sticker-style';
            style.textContent = `
                @keyframes bgmDance {
                    0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
                    25% { transform: translateY(-8px) rotate(-6deg) scale(1.05); }
                    75% { transform: translateY(-3px) rotate(6deg) scale(0.98); }
                }
                .bgm-dancing {
                    animation: bgmDance 1.5s infinite ease-in-out;
                }
            `;
            document.head.appendChild(style);
        }

        const container = document.createElement('div');
        container.id = 'bgm-fallback-sticker';
        Object.assign(container.style, {
            position: 'fixed',
            top: '50px',
            right: '50px',
            zIndex: '99999',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            userSelect: 'none'
        });

        const img = document.createElement('img');
        img.src = STICKER_SRC;
        img.alt = '';
        img.className = 'bgm-dancing';
        Object.assign(img.style, {
            width: '300px',
            height: '300px',
            objectFit: 'cover',
            borderRadius: '10%',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
            transition: 'transform 0.2s ease'
        });

        container.appendChild(img);
        document.body.appendChild(container);
    }

    function syncStickerAnimation(isPlaying) {
        const container = document.getElementById('bgm-fallback-sticker');
        if (!container) return;
        const img = container.querySelector('img');
        if (img) {
            img.style.animationPlayState = isPlaying ? 'running' : 'paused';
            img.style.opacity = isPlaying ? '1' : '0.5';
        }
    }

    function createMusicWidget() {
        if (document.getElementById('bgm-widget-container')) return;

        const container = document.createElement('div');
        container.id = 'bgm-widget-container';

        Object.assign(container.style, {
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: '99999',
            backgroundColor: '#1c1c1c',
            color: '#e0e0e0',
            border: '1px solid #444444',
            borderRadius: '4px',
            padding: '6px 10px',
            fontSize: '11px',
            fontFamily: 'monospace, sans-serif',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            userSelect: 'none'
        });

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'bgm-toggle-btn';
        toggleBtn.type = 'button';
        toggleBtn.textContent = 'BGM: OFF';

        Object.assign(toggleBtn.style, {
            backgroundColor: '#2a2a2a',
            color: '#e0e0e0',
            border: '1px solid #555555',
            borderRadius: '3px',
            padding: '3px 8px',
            fontSize: '11px',
            fontFamily: 'monospace, sans-serif',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
        });

        toggleBtn.addEventListener('mouseenter', () => {
            toggleBtn.style.backgroundColor = '#383838';
        });
        toggleBtn.addEventListener('mouseleave', () => {
            toggleBtn.style.backgroundColor = '#2a2a2a';
        });

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (audio.paused) {
                audio.play().then(() => {
                    sessionStorage.setItem('bgm_playing', 'true');
                    updateWidget(true);
                    syncStickerAnimation(true);
                }).catch(err => console.error(err));
            } else {
                audio.pause();
                sessionStorage.setItem('bgm_playing', 'false');
                updateWidget(false);
                syncStickerAnimation(false);
            }
        });

        const volLabel = document.createElement('span');
        volLabel.textContent = 'Vol:';
        volLabel.style.color = '#888888';

        const volSlider = document.createElement('input');
        volSlider.type = 'range';
        volSlider.min = '0';
        volSlider.max = '1';
        volSlider.step = '0.05';
        volSlider.value = audio.volume.toString();

        Object.assign(volSlider.style, {
            width: '60px',
            cursor: 'pointer',
            accentColor: '#888888'
        });

        const volValue = document.createElement('span');
        volValue.id = 'bgm-vol-val';
        volValue.textContent = Math.round(audio.volume * 100) + '%';
        volValue.style.color = '#aaaaaa';
        volValue.style.minWidth = '28px';

        volSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            audio.volume = val;
            localStorage.setItem('bgm_volume', val.toString());
            volValue.textContent = Math.round(val * 100) + '%';
        });

        container.appendChild(toggleBtn);
        container.appendChild(volLabel);
        container.appendChild(volSlider);
        container.appendChild(volValue);

        document.body.appendChild(container);
    }

    function updateWidget(isPlaying) {
        const toggleBtn = document.getElementById('bgm-toggle-btn');
        if (!toggleBtn) return;
        toggleBtn.textContent = isPlaying ? 'BGM: ON' : 'BGM: OFF';
        syncStickerAnimation(isPlaying);
    }

    function tryPlay() {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                sessionStorage.setItem('bgm_playing', 'true');
                updateWidget(true);
            }).catch(() => {
                updateWidget(false);
                const handleFirstInteraction = () => {
                    if (sessionStorage.getItem('bgm_playing') !== 'false') {
                        audio.play().then(() => {
                            sessionStorage.setItem('bgm_playing', 'true');
                            updateWidget(true);
                        }).catch(() => { });
                    }
                    window.removeEventListener('click', handleFirstInteraction);
                    window.removeEventListener('keydown', handleFirstInteraction);
                };
                window.addEventListener('click', handleFirstInteraction, { once: true });
                window.addEventListener('keydown', handleFirstInteraction, { once: true });
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        createMusicWidget();
        if (isFallback) {
            showFallbackSticker();
        }
        const shouldPlay = sessionStorage.getItem('bgm_playing') !== 'false';
        if (shouldPlay) {
            tryPlay();
        } else {
            updateWidget(false);
        }
    });
})();
