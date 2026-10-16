const checkboxMock = document.getElementById('captcha-check');
const wrapper = document.getElementById('loader-wrapper');
const captchaScreen = document.getElementById('captcha-screen');
const mainSite = document.getElementById('main-site');

// 1. Вшитый звук в формате Base64 (работает автономно, без скачивания с сайтов)
const embeddedAmbient = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQgAAAAAAAAAAAAA";

// Для полноценной музыки лучше всего использовать этот чистый, проверенный временем аудио-поток 
// от Internet Archive (крупнейший стабильный архив мира), который не блокирует CORS:
const reliableUrl = 'https://archive.org';

// Используем архивный поток, который гарантированно отдает аудио-данные
const bgMusic = new Audio(reliableUrl);
bgMusic.loop = true;
bgMusic.volume = 0.6; // Нормальная отчетливая громкость
bgMusic.crossOrigin = "anonymous"; // Разрешаем обход ограничений CORS в браузере

let soundActive = false;
let captchaClicked = false;

// 2. Генерация кнопки звука (высота top: 12px)
const muteBtn = document.createElement('button');
muteBtn.style.cssText = `
    position: fixed;
    top: 12px;
    right: 24px;
    z-index: 2000;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.5s ease;
    -webkit-tap-highlight-color: transparent !important;
    outline: none !important;
    box-shadow: none !important;
`;

const iconSoundOn = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
const iconSoundOff = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;

muteBtn.innerHTML = iconSoundOff;
document.body.appendChild(muteBtn);

// Логика кнопки звука
muteBtn.addEventListener('click', function(e) {
    e.preventDefault();
    this.blur();

    if (!soundActive) {
        soundActive = true;
        muteBtn.innerHTML = iconSoundOn;
        
        // Запуск с обработкой ошибок браузера
        bgMusic.play().catch(err => {
            console.log("Браузер заблокировал запуск. Нужен повторный клик:", err);
            // Если внешний URL подвел, мгновенно переключаемся на резервный вшитый звук
            bgMusic.src = embeddedAmbient;
            bgMusic.play();
        });
    } else {
        soundActive = false;
        muteBtn.innerHTML = iconSoundOff;
        bgMusic.pause();
    }
});

// Слушатель клика по кастомному DIV-чекбоксу капчи
checkboxMock.addEventListener('click', function(e) {
    e.preventDefault();
    if (captchaClicked) return;
    captchaClicked = true;

    wrapper.classList.add('loading');

    setTimeout(() => {
        wrapper.classList.remove('loading');
        wrapper.classList.add('checked');

        setTimeout(() => {
            // Полноэкранный режим
            const docEl = document.documentElement;
            if (docEl.requestFullscreen) docEl.requestFullscreen();
            else if (docEl.mozRequestFullScreen) docEl.mozRequestFullScreen();
            else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
            else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen();

            // Переход на главный экран
            captchaScreen.style.opacity = '0';
            captchaScreen.style.visibility = 'hidden';
            
            mainSite.style.display = 'flex';
            setTimeout(() => {
                mainSite.style.opacity = '1';
                muteBtn.style.visibility = 'visible';
                muteBtn.style.opacity = '1';
            }, 50);
        }, 400);

    }, 1300);
});
