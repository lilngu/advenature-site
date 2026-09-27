/**
 * Advenature - Text Strings Central Repository
 * Tất cả chuỗi văn bản giao diện tập trung tại đây để dễ dàng quản lý, chỉnh sửa, dịch thuật.
 * Usage: import { TEXTS } from './texts.js'; hoặc window.TEXTS (global)
 * 
 * CẤU TRÚC KEY PHẢI KHỚP CHÍNH XÁC VỚI data-i18n TRONG index.html
 */

const TEXTS = {
    // ======================================================
    // META & DOCUMENT
    // ======================================================
    meta: {
        title: "Advenature - Loot Box Tinh Quang",
        scrollBgAlt: "Cuộn Thư Tinh Linh",
    },

    // ======================================================
    // WELCOME SCROLL BANNER
    // ======================================================
    welcome: {
        title: "✦ ĐANG KHỞI TẠO CỔNG DỊCH CHUYỂN ... ✦",
        body: "Chào mừng đến LINH CẢNH KHỞI NGUYÊN! <br> Điểm tập kết của Nhà Phiêu Lưu <br> trước khi vào RỪNG TINH LINH thực cảnh. </br> ⋆｡‧˚ʚ🔮ɞ˚‧｡⋆",
        tapHint: "✦ Chạm cổ thư để tiếp tục ✦",
    },

    // ======================================================
    // GUEST HELPER FAIRY
    // ======================================================
    guestHelper: {
        tooltip: "Khai mở viên Quang Thạch đầu tiên!",
    },

    // ======================================================
    // TOP STATUS BAR
    // ======================================================
    topbar: {
        brand: "✦ ADVENATURE",
        currencies: {
            tinhQuang: "Tinh Quang",
            tinhThach: "Quang Thạch",
            congHien: "Cống Hiến",
        },
        loginBtn: "✦ Đăng Nhập",
    },

    // ======================================================
    // GACHA VIEW
    // ======================================================
    gacha: {
        tabIndicator: "✦LINH CẢNH KHỞI NGUYÊN✦",
        crystalTitleDefault: "Bệ Đá Tinh Quang",
        claimButton: "✦ THU THẬP VÀO TÚI ✦",
        collectBanner: "ĐÃ THU THẬP QUANG THẠCH VÀO TÚI",
        lootTitlePrefix: "✦ ",
        lootTitleSuffix: " ✦",
        lootMetaTemplate: "[{shapeName}] • {faceCount} DIỆN THỂ • MÃ: {code}",
    },

    // ======================================================
    // BOTTOM DOCK NAVIGATION (Tooltips)
    // ======================================================
    dock: {
        questTooltip: "Nhiệm Vụ",
        inventoryTooltip: "Túi Đồ",
        gachaTooltip: "Triệu Hồi Gacha",
        shopTooltip: "Shop",
        profileTooltip: "Hồ Sơ",
    },

    // ======================================================
    // INVENTORY PANEL
    // ======================================================
    inventory: {
        panelTitle: "✦ TÚI TRỮ VẬT ✦",
        tabs: {
            gems: "✦ Tinh Quang Thạch ({count}/990)",
            items: "✦ Vật Phẩm & Thẻ",
        },
        progressLabel: "Tiến trình sưu tầm: {percent}%",
        filters: {
            all: "Tất cả",
            fire: "Hỏa",
            sun: "Thái Dương",
            wood: "Mộc",
            ice: "Băng",
            lightning: "Thiên",
            magic: "Ma",
        },
        gemSlot: {
            lockedName: "Chưa mở",
            unknownCode: "???",
        },
        backBtnAria: "Trở về",
    },

    // ======================================================
    // QUEST PANEL
    // ======================================================
    quest: {
        panelTitle: "📜 TRẠM NHIỆM VỤ TINH LINH",
        checkin: {
            cardTitle: "Trạm Điểm Danh",
            cardDesc: "Nhận 1 🔮/ngày. Chuỗi 7 ngày tặng thêm +1 🔮.",
            btn: "Điểm Danh",
            btnLoading: "Đang kiểm tra...",
            btnDone: "Đã Điểm Danh",
            successDaily: "✦ Điểm danh thành công! Nhận +1 🔮 Tinh Quang.",
            successStreak7: "🎉 XUẤT SẮC! Đạt mốc chuỗi 7 ngày liên tục! Thưởng thêm +1 🔮 (Tổng nhận +2 🔮).",
            error: "Không thể điểm danh!",
            networkError: "Lỗi kết nối máy chủ điểm danh!",
        },
        fbShare: {
            cardTitle: "Truyền Tin Bang",
            cardDesc: "Đăng bài Group Advenature, dán link nhận +1 🔮.",
            inputPlaceholder: "Link bài viết...",
            btn: "Gửi Duyệt",
            btnLoading: "Đang gửi...",
            success: "✦ Đã gửi link bài viết cho Quản trị viên Telegram! Vui lòng chờ duyệt (+1 🔮).",
            error: "Thử lại sau!",
            invalidUrl: "Vui lòng nhập đường link bài viết hợp lệ (bắt đầu bằng http...)!",
            networkError: "Không thể kết nối đến máy chủ duyệt nhiệm vụ!",
        },
        referral: {
            cardTitle: "Kết Nối",
            codeLabel: "Mã: {code} (+1 🔮 cả 2).",
            codePlaceholder: "Mã AWxxxx...",
            scanBtnAria: "Quét mã QR",
            btn: "Xác Nhận",
            btnLoading: "Đang kết nối...",
            success: "🎉 KẾT NỐI THÀNH CÔNG!\nBạn và [{friendName} - {friendCode}] đã kết nối thành công. Cả 2 đều được nhận +1 🔮 Tinh Quang!",
            invalidCode: "Vui lòng nhập đúng mã Nhà Phiêu Lưu (bắt đầu bằng AW, ví dụ: AW8391)!",
            error: "Không thể kết nối với mã này!",
            networkError: "Lỗi kết nối đến máy chủ!",
        },
        quiz: {
            cardTitle: "Mật Mã Tinh Linh",
            cardDesc: "Giải mã tri thức cổ đại từ Rừng Già nhận +1 🔮.",
            badge: "10 Câu Đố Vui",
            btn: "Giải Mã",
        },
        backBtnAria: "Trở về",
    },

    // ======================================================
    // SHOP PANEL
    // ======================================================
    shop: {
        panelTitle: "🛒 SHOP LỮ HÀNH RỪNG TINH LINH",
        subtitle: "Chạm vào gói hoặc tiện ích để xem chi tiết",
        priceTemplate: "💎 {tt} Tinh Thạch (~{vnd} đ)",
        checkout: {
            count: "Đã chọn: {count} mục",
            total: "Tổng: {tt} 💎 (~{vnd} đ)",
            btn: "✦ ĐẶT MUA ✦",
        },
        scheduleBtn: {
            badge: "SỰ KIỆN THỰC ĐỊA",
            title: "📅 LỊCH TRÌNH THÁM HIỂM RỪNG TINH LINH",
            desc: "Xem lịch khởi hành các tour cắm trại, săn thạch và số lượng người tham gia.",
            cta: "✦ Khám phá lịch trình ✦",
        },
        scheduleNote: "*Sở hữu ít nhất 1 Gói Tân Thủ trong túi để đăng ký giữ chỗ chính thức.",
        detailModal: {
            title: "Tên Sản Phẩm",
            price: "0 💎",
            desc: "Mô tả sản phẩm...",
            selectBtn: "CHỌN MỤC NÀY",
            deselectBtn: "BỎ CHỌN MỤC NÀY",
        },
        checkoutSuccess: "✦ Thông tin đơn hàng đã gửi tới Hội Ngọc Lục! Trưởng đoàn sẽ liên hệ sớm nhất qua SĐT/Zalo.",
        checkoutError: "Vui lòng chạm chọn ít nhất 1 gói hoặc tiện ích!",
    },

    // ======================================================
    // PROFILE PANEL
    // ======================================================
    profile: {
        panelTitle: "✦THẺ TINH THỦ",
        uploadBadgeTitle: "Đổi ảnh đại diện",
        defaultCode: "AW----",
        defaultName: "TINH THỦ",
        defaultEmail: "chua_lien_ket@advenature.local",
        defaultRole: "Tân Thủ Rừng Già",
        defaultClass: "Chưa có",
        defaultTribe: "Tự do",
        defaultGender: "Nam",
        defaultBirth: "----",
        infoLabels: {
            class: "Chức Nghiệp",
            tribe: "Bộ Tộc",
            gender: "Giới Tính",
            birth: "Năm Sinh",
        },
        defaultValues: {
            class: "Chưa có",
            tribe: "Tự do",
            gender: "Nam",
            birth: "----",
        },
        stats: {
            tinhQuang: "Tinh Quang",
            tinhThach: "Quang Thạch",
            congHien: "Cống Hiến",
        },
        rank: {
            label: "Cấp Bậc: {title}",
            need: "{need} Điểm Lên Cấp",
            defaultTitle: "Tập Sự",
        },
        guildBanners: {
            guild: {
                title: "ĐIỀU LỆ & LẬP BANG HỘI",
                desc: "Quy chế Hội Ngọc Lục, quyền lợi thủ lĩnh bang.",
            },
            ranger: {
                title: "CHIÊU MỘ NPC RANGER RỪNG",
                desc: "Ứng tuyển người dẫn đường thực địa & nhận thù lao.",
            },
        },
        qrNote: "Mã QR Định Danh Nhà Phiêu Lưu Thực Địa",
        backBtnAria: "Trở về",
    },

    // ======================================================
    // ONBOARDING MODAL (2 bước)
    // ======================================================
    onboarding: {
        step1: {
            title: "✦ ĐỊNH DANH TINH THỦ ✦",
            desc: "Vui lòng xác thực tài khoản Google để lưu giữ Quang Thạch đầu tiên của bạn.",
            requiredNote: "*Bắt buộc để liên kết THẺ",
        },
        step2: {
            title: "✦ THIẾT LẬP THẺ TINH THỦ ✦",
            verifiedBadge: "✓ Đã xác thực: {email}",
            labels: {
                name: "Tên Tinh Thủ:",
                gender: "Giới tính:",
                avatar: "Chọn hình đại diện ban đầu:",
                birth: "Năm sinh:",
                class: "Chức nghiệp:",
                tribe: "Bộ tộc:",
                phone: "Số Zalo liên hệ:",
            },
            genderOptions: [
                "👨 Nam",
                "👩 Nữ",
                "🌈 Tự do"
            ],
            avatarNote: "*Có thể đổi sang ảnh cá nhân ở trang Hồ Sơ sau.",
            namePlaceholder: "Nhập tên của bạn...",
            birthPlaceholder: "VD: 1998",
            classPlaceholder: "VD: Thợ săn, Bác sĩ...",
            tribePlaceholder: "VD: Rừng Sương Mù, Gió Tây...",
            phonePlaceholder: "VD: 0912345678",
            submitBtn: "✦ HOÀN TẤT & THU THẬP VÀO TÚI ✦",
            validation: {
                name: "Vui lòng nhập Tên Nhà Phiêu Lưu!",
                phone: "Vui lòng nhập Số điện thoại / Zalo!",
                birth: "Vui lòng nhập Năm sinh!",
                class: "Vui lòng nhập Chức nghiệp của bạn!",
                tribe: "Vui lòng nhập Bộ tộc của bạn!",
            },
        },
    },

    // ======================================================
    // BLESSING MODAL
    // ======================================================
    blessing: {
        tierTag: "{tier}",
        title: "Chúc Phúc Tinh Linh",
        descPrefix: "{reason}\n{desc}",
        note: "*Chúc phúc này có hiệu lực khi bạn tham gia hoạt động tại Rừng Tinh Linh!",
        shopBtn: "✦ KHÁM PHÁ GÓI TÂN THỦ ✦",
        closeBtn: "Cất Vào Túi Đồ",
    },

    // ======================================================
    // QUIZ MODAL
    // ======================================================
    quiz: {
        title: "✦ MẬT MÃ RỪNG TINH LINH",
        questionLabel: "Câu hỏi: {question}",
    },

    // ======================================================
    // GEM PREVIEW MODAL
    // ======================================================
    gemPreview: {
        sysTagTemplate: "<i class=\"rpg-ico ico-elem-fire\"></i> Hỏa Diệm",
        codeTag: "☀️3243",
        title: "Tinh Thể Thái Dương",
        shapeLabel: "Hình Thái",
        shapeValue: "Phiến Thạch",
        facesLabel: "Cấp Bậc Mặt",
        facesValue: "24 Diện Thể",
        desc: "Khoáng thạch cổ thụ tích tụ linh lực nguyên tố tinh khiết của Rừng Tinh Linh.",
        // Locked state texts (dùng khi đá chưa mở khóa)
        lockedTitle: "Tinh Quang Thạch Ẩn Danh",
        lockedShape: "Chưa khám phá",
        lockedFaces: "?? Mặt",
        lockedDesc: "Biến thể huyền bí này chưa được khai mở. Hãy triệu hồi tại Bệ Đá Tinh Quang để thu thập vào bộ sưu tập!",
    },

    // ======================================================
    // ITEM MODAL
    // ======================================================
    itemModal: {
        title: "Tên Vật Phẩm",
        badgeOffline: "VẬT PHẨM THỰC ĐỊA",
        desc: "Mô tả vật phẩm...",
        qrTokenLabel: "MÃ: QR_XXXXXXXX",
        qrLiveStatus: "Sẵn sàng xác thực thực địa",
        useBuffBtn: "✦ SỬ DỤNG BUFF NGAY ✦",
        qrNoteService: "Đưa mã này cho Trưởng Hội / NPC tại Hội Ngọc Lục để đổi lấy dịch vụ thực tế.",
    },

    // ======================================================
    // ADMIN MODAL
    // ======================================================
    admin: {
        title: "⚡ ADMIN GOD-MODE TEST",
        actions: {
            addTQ: "+99 🔮 Tinh Quang",
            addTT: "+99 💎 Tinh Thạch",
            addCH: "+100 🛡️ Cống Hiến",
            unlockAllGems: "🔓 Mở Khóa Đủ 990 Đá",
            addAllItems: "🎒 Thêm Đủ 30 Chúc Phúc Vào Túi",
            toggleFastGacha: "⚡ Fast Gacha: TẮT",
            resetData: "⚠️ Xóa Dữ Liệu Test",
        },
        fastGachaOn: "BẬT (0.1s)",
        fastGachaOff: "TẮT",
        resetConfirm: "Reset về Tân Thủ?",
        feedback: {
            addedTQ: "⚡ Admin: +99 🔮 (Đã ghi nhận vào Database D1)",
            addedTT: "⚡ Admin: +99 💎 (Đã ghi nhận vào Database D1)",
            addedCH: "⚡ Admin: +100 🛡️ (Đã ghi nhận vào Database D1)",
            unlockedAll: "⚡ Admin: Đã mở full 990 đá!",
            addedAllItems: "⚡ Admin: Đã thêm đủ 30 Chúc Phúc vào túi!",
        },
    },

    // ======================================================
    // SCHEDULE MODAL
    // ======================================================
    schedule: {
        title: "✦ LỊCH TRÌNH SỰ KIỆN THỰC ĐỊA ✦",
        events: [
            {
                date: "15 THÁNG NÀY",
                title: "Đêm Lửa Trại & Khai Mở Thạch Quán",
                location: "Địa điểm: Rừng Tinh Linh, Bảo Lộc",
                slots: "18/25 chỗ",
            },
            {
                date: "CUỐI TUẦN NÀY",
                title: "Hành Trình Băng Suối Vực Mây",
                location: "Trekking 8km + Thưởng trà bình minh",
                slots: "22/30 chỗ",
            },
            {
                date: "MÙNG 1 ĐẦU THÁNG",
                title: "Phiên Chợ Đổi Thạch Tinh Linh",
                location: "Giao lưu khoáng thạch & BBQ đêm",
                slots: "35/50 chỗ",
            },
        ],
    },

    // ======================================================
    // GUILD MODAL
    // ======================================================
    guild: {
        title: "🏰 ĐIỀU LỆ HỘI NGỌC LỤC",
        rules: [
            "1. Hội Ngọc Lục là liên minh những người đam mê thám hiểm thiên nhiên và thu thập khoáng thạch.",
            "2. Điểm Cống Hiến (🛡️ CP) được tích lũy qua các chuyến dã ngoại và hoạt động bang.",
            "3. Đạt mốc 100 CP để thăng cấp thành viên chính thức và mở quyền lập phân hội riêng.",
        ],
        registerBtn: "✦ ĐĂNG KÝ THÀNH LẬP BANG ✦",
    },

    // ======================================================
    // RANGER MODAL
    // ======================================================
    ranger: {
        title: "🌲 ỨNG TUYỂN NPC RANGER",
        desc: [
            "• <b>Vai trò:</b> Người dẫn đoàn thám hiểm, phát thẻ Quest và hỗ trợ người chơi tại thực địa.",
            "• <b>Quyền lợi:</b> Hỗ trợ chi phí di chuyển, lưu trú Glamping miễn phí và nhận trang bị độc bản.",
            "• <b>Yêu cầu:</b> Yêu thích cắm trại, có kỹ năng sinh tồn cơ bản và trách nhiệm cao.",
        ],
        applyBtn: "✦ NỘP HỒ SƠ RANGER ✦",
    },

    // ======================================================
    // AVATAR UPLOAD
    // ======================================================
    avatarUpload: {
        triggerTitle: "Đổi ảnh đại diện",
        uploading: "⏳",
        fileTooLarge: "Vui lòng chọn ảnh có dung lượng dưới 5MB!",
        success: "✦ Cập nhật ảnh đại diện thành công!",
        uploadFailed: "Kiểm tra lại ImgBB API Key!",
        networkError: "Không thể kết nối đến máy chủ ảnh!",
    },

    // ======================================================
    // FRIEND QR SCAN MODAL
    // ======================================================
    friendQrScan: {
        title: "📷 QUÉT MÃ CĂN CƯỚC BẠN BÈ",
        hint: "Hướng camera vào mã QR Căn Cước của bạn bè để tự động nhập mã.",
    },

    // ======================================================
    // COMMON / SHARED
    // ======================================================
    common: {
        close: "Đóng",
        timesSymbol: "×",
        avatarAlt: "Avatar",
    },
};

// Global exposure for non-module scripts
if (typeof window !== 'undefined') {
    window.TEXTS = TEXTS;
}