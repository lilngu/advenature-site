// ======================================================
// READER-MODAL — Module dùng chung cho modal xem ảnh lật trang
// Tách từ guideReaderModal để tái dùng mà không sao chép code.
// Giữ nguyên HTML/CSS/ID cũ — chỉ thay JS bên trong app.js.
//
// Cách dùng:
//   import { createReaderModal } from '@reader';
//   const guideReader = createReaderModal({
//     modalId: 'guideReaderModal', wrapperId: 'guideSwiperWrapper',
//     swiperSelector: '.guideSwiper',
//     navNext: '.guide-swiper-btn.swiper-button-next',
//     navPrev: '.guide-swiper-btn.swiper-button-prev',
//     indicatorId: 'guidePageIndicator', prevBtnId: 'guideBtnPrev',
//     nextBtnId: 'guideBtnNext', pages: GUIDE_PAGES_DATA,
//     onOpen: () => { guideReaderOpen = true; },
//     onClose: () => { guideReaderOpen = false; },
//   });
//   guideReader.open();          // mở (có thể truyền mảng pages khác để tái dùng)
//   guideReader.open(otherPages);
//   guideReader.close();
// ======================================================

const READER_PLACEHOLDER_IMG =
    "https://placehold.co/600x900/2a1b12/d4af37?text=Lỗi+tải+ảnh";

export function createReaderModal(options = {}) {
    const {
        modalId = "",
        wrapperId = "",
        swiperSelector = "",
        navNext = "",
        navPrev = "",
        indicatorId = "",
        prevBtnId = "",
        nextBtnId = "",
        pages = [],
        closeTimeout = 400,
        placeholderImg = READER_PLACEHOLDER_IMG,
        onOpen = null,
        onClose = null,
    } = options;

    let swiper = null;
    let currentPages = Array.isArray(pages) ? pages : [];
    let openFlag = false;
    // Bind nút Prev/Next 1 lần duy nhất (code cũ bind mỗi lần init
    // nên mở/đóng nhiều lần sẽ lật 2-3 trang cho 1 click).
    let footerBound = false;

    const getModal = () => (modalId ? document.getElementById(modalId) : null);

    function isOpen() {
        return openFlag;
    }

    function updateIndicator(index) {
        const indicator = indicatorId ? document.getElementById(indicatorId) : null;
        const btnPrev = prevBtnId ? document.getElementById(prevBtnId) : null;
        const btnNext = nextBtnId ? document.getElementById(nextBtnId) : null;
        const total = currentPages.length;
        if (indicator) indicator.innerText = `${index + 1} / ${total}`;
        if (btnPrev) btnPrev.disabled = index === 0;
        if (btnNext) btnNext.disabled = index === total - 1;
    }

    function renderSlides() {
        const wrapper = wrapperId ? document.getElementById(wrapperId) : null;
        if (!wrapper) return;
        wrapper.innerHTML = "";
        currentPages.forEach((page) => {
            const slide = document.createElement("div");
            slide.className = "swiper-slide";
            slide.innerHTML = `
                <img src="${page.url}" alt="${page.title || ""}" class="lore-comic-img" crossorigin="anonymous" onerror="this.src='${placeholderImg}'"/>
            `;
            wrapper.appendChild(slide);
        });
    }

    function bindFooterOnce() {
        if (footerBound) return;
        footerBound = true;
        if (prevBtnId) {
            document.getElementById(prevBtnId)?.addEventListener("click", () => swiper?.slidePrev());
        }
        if (nextBtnId) {
            document.getElementById(nextBtnId)?.addEventListener("click", () => swiper?.slideNext());
        }
    }

    function initSwiper() {
        renderSlides();
        // Giữ nguyên selector toàn cục như code cũ để không lệch CSS/hành vi.
        swiper = new Swiper(swiperSelector, {
            effect: "flip",
            grabCursor: true,
            speed: 500,
            flipEffect: {
                slideShadows: true,
                limitRotation: true
            },
            navigation: {
                nextEl: navNext,
                prevEl: navPrev,
            },
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            on: {
                slideChange: () => {
                    updateIndicator(swiper.activeIndex);
                }
            }
        });
        bindFooterOnce();
    }

    function open(pagesOverride) {
        const modal = getModal();
        if (!modal) return;
        if (Array.isArray(pagesOverride) && pagesOverride.length > 0) {
            currentPages = pagesOverride;
        }
        modal.classList.remove("hidden");
        openFlag = true;

        if (!swiper) {
            initSwiper();
        } else {
            swiper.slideTo(0, 0);
        }
        updateIndicator(0);

        // Force reflow then show
        modal.offsetHeight;
        requestAnimationFrame(() => {
            modal.classList.add("show");
        });

        // Disable body scroll
        document.body.style.overflow = "hidden";
        if (typeof onOpen === "function") onOpen();
    }

    function close() {
        const modal = getModal();
        if (!modal) return;
        modal.classList.remove("show");
        openFlag = false;

        // Destroy Swiper to release grabCursor styles
        if (swiper) {
            swiper.destroy(true, true);
            swiper = null;
        }

        setTimeout(() => {
            modal.classList.add("hidden");
            // Re-enable body scroll
            document.body.style.overflow = "";
            // Ensure cursor resets on body
            document.body.style.cursor = "";
            if (typeof onClose === "function") onClose();
        }, closeTimeout);
    }

    function next() {
        swiper?.slideNext();
    }

    function prev() {
        swiper?.slidePrev();
    }

    function handleKeydown(e) {
        if (!openFlag) return false;
        if (e.key === "ArrowRight" || e.key === " ") {
            next();
            return true;
        } else if (e.key === "ArrowLeft") {
            prev();
            return true;
        } else if (e.key === "Escape") {
            close();
            return true;
        }
        return false;
    }

    function setPages(nextPages) {
        if (Array.isArray(nextPages)) currentPages = nextPages;
    }

    return {
        open,
        close,
        next,
        prev,
        isOpen,
        handleKeydown,
        setPages,
        get swiper() {
            return swiper;
        },
        get pagesCount() {
            return currentPages.length;
        }
    };
}
