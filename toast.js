/**
 * Toast Notification System - Thay thế alert() bằng UI RPG style
 * Usage: 
 *   import { toast } from './toast.js';
 *   toast.success('Thành công!', 'Chi tiết thông báo...');
 *   toast.error('Lỗi!', 'Mô tả lỗi...');
 *   toast.warning('Cảnh báo', 'Nội dung...');
 *   toast.info('Thông tin', 'Nội dung...');
 *   toast.magic('Phép thuật', 'Hiệu ứng ma pháp...');
 */

const TOAST_DEFAULTS = {
    duration: 4000,
    maxToasts: 5,
};

let toastContainer = null;

/** Khởi tạo container */
function initToastContainer() {
    if (toastContainer) return toastContainer;
    toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        toastContainer.setAttribute('aria-live', 'polite');
        toastContainer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

/** Tạo element toast */
function createToastElement({ type = 'info', title, message, duration = TOAST_DEFAULTS.duration, onClose }) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.position = 'relative';
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
        magic: '✦',
    };
    
    const titles = {
        success: 'THÀNH CÔNG',
        error: 'LỖI',
        warning: 'CẢNH BÁO',
        info: 'THÔNG BÁO',
        magic: 'TINH LINH',
    };
    
    const displayTitle = title || titles[type] || 'THÔNG BÁO';
    
    toast.innerHTML = `
        <div class="toast-icon" aria-hidden="true">${icons[type] || icons.info}</div>
        <div class="toast-content">
            <div class="toast-title">${displayTitle}</div>
            <div class="toast-message">${message || ''}</div>
        </div>
        <button class="toast-close" aria-label="Đóng thông báo">&times;</button>
        <div class="toast-progress" aria-hidden="true"></div>
    `;
    
    const closeBtn = toast.querySelector('.toast-close');
    const progressBar = toast.querySelector('.toast-progress');
    
    let dismissed = false;
    let progressTimer = null;
    
    const dismiss = (animate = true) => {
        if (dismissed) return;
        dismissed = true;
        
        if (progressTimer) clearTimeout(progressTimer);
        
        if (animate) {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => {
                toast.remove();
                if (onClose) onClose();
            }, { once: true });
        } else {
            toast.remove();
            if (onClose) onClose();
        }
    };
    
    closeBtn.addEventListener('click', () => dismiss(true));
    
    // Auto dismiss với progress bar
    if (duration > 0) {
        progressBar.style.animationDuration = `${duration}ms`;
        progressTimer = setTimeout(() => dismiss(true), duration);
    }
    
    // Pause on hover
    toast.addEventListener('mouseenter', () => {
        if (progressTimer) clearTimeout(progressTimer);
        progressBar.style.animationPlayState = 'paused';
    });
    
    toast.addEventListener('mouseleave', () => {
        if (!dismissed && duration > 0) {
            const remaining = duration - (Date.now() - toast.dataset.startTime);
            if (remaining > 0) {
                progressBar.style.animationDuration = `${remaining}ms`;
                progressBar.style.animationPlayState = 'running';
                progressTimer = setTimeout(() => dismiss(true), remaining);
            }
        }
    });
    
    toast.dataset.startTime = Date.now();
    
    return { element: toast, dismiss };
}

/** Hiển thị toast */
function showToast(options) {
    const container = initToastContainer();
    
    // Giới hạn số lượng toast
    const existingToasts = container.querySelectorAll('.toast:not(.removing)');
    if (existingToasts.length >= TOAST_DEFAULTS.maxToasts) {
        existingToasts[0].classList.add('removing');
        setTimeout(() => existingToasts[0].remove(), 300);
    }
    
    const { element, dismiss } = createToastElement(options);
    container.appendChild(element);
    
    return { dismiss };
}

/** Toast API */
export const toast = {
    success: (title, message, duration) => showToast({ type: 'success', title, message, duration }),
    error: (title, message, duration) => showToast({ type: 'error', title, message, duration }),
    warning: (title, message, duration) => showToast({ type: 'warning', title, message, duration }),
    info: (title, message, duration) => showToast({ type: 'info', title, message, duration }),
    magic: (title, message, duration) => showToast({ type: 'magic', title, message, duration }),
    
    // Custom toast with full options
    show: (options) => showToast(options),
    
    // Clear all toasts
    clear: () => {
        const container = initToastContainer();
        container.querySelectorAll('.toast').forEach(t => {
            t.classList.add('removing');
            setTimeout(() => t.remove(), 300);
        });
    }
};

// Also expose globally for non-module scripts
if (typeof window !== 'undefined') {
    window.toast = toast;
}