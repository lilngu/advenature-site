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
    // GUEST HELPER FAIRY (Chỉ cho Guest mode)
    // ======================================================
    guestHelper: {
        tooltip: "Khai mở viên Quang Thạch đầu tiên!",
    },

    // ======================================================
    // GUIDE HELPER FAIRY (Cho user đã login)
    // ======================================================
    guideHelper: {
        tooltip: "HƯỚNG DẪN TINH THỦ",
    },

    // ======================================================
    // LORE READER MODAL
    // ======================================================
    loreReader: {
        title: "✦ CỔ THƯ RỪNG TINH LINH ✦",
        prevBtn: "TRƯỚC",
        nextBtn: "TIẾP",
    },

    // ======================================================
    // GUIDE READER MODAL (Hướng dẫn Tinh Thủ)
    // ======================================================
    guideReader: {
        title: "✦ HƯỚNG DẪN TINH THỦ ✦",
        prevBtn: "TRƯỚC",
        nextBtn: "TIẾP",
    },

    // ======================================================
    // TOP STATUS BAR
    // ======================================================
    topbar: {
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
        tabIndicator: "✦LINH CẢNH✦",
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
        panelTitle: "📜 NHIỆM VỤ HẰNG NGÀY",
        guide: {
            title: "✦ DAILY QUESTS ✦",
            desc: "Hoàn thành quest mỗi ngày để tích luỹ năng lượng Tinh Quang, quay Gacha thu thập Quang Thạch đổi đặc quyền tại Rừng Tinh Linh! ",
        },
        checkin: {
            cardTitle: "KẾT NỐI LINH CẢNH",
            cardDesc: "Đăng nhập mỗi ngày để duy trì kết nối với Linh Cảnh.\n Phần thưởng: +1 ✨ Tinh Quang",
            btn: "KÍCH HOẠT ĐIỂM DANH",
            btnLoading: "Đang kiểm tra...",
            btnDone: "Đã Điểm Danh",
            successDaily: "✦ Điểm danh thành công! Nhận +1 ✨ Tinh Quang.",
            successStreak7: "🎉 XUẤT SẮC! Đạt mốc chuỗi 7 ngày liên tục! Thưởng thêm +1 ✨.",
            error: "Không thể điểm danh!",
            networkError: "Lỗi kết nối máy chủ điểm danh!",
        },
        fbShare: {
            cardTitle: "💬 TRUYỀN TIN TINH LINH ",
            cardDesc: "Đăng bài Group Advenature, dán link nhận +1 ✨.",
            inputPlaceholder: "Link bài viết...",
            btn: "CHIA SẺ TIN",
            btnLoading: "Đang gửi...",
            success: "✦ Đã gửi link bài viết cho Trưởng Hội! Vui lòng chờ duyệt (+1 🔮).",
            error: "Thử lại sau!",
            invalidUrl: "Vui lòng nhập đường link bài viết hợp lệ (bắt đầu bằng http...)!",
            networkError: "Không thể kết nối đến máy chủ duyệt nhiệm vụ!",
        },
        referral: {
            cardTitle: "KẾT NỐI TINH THỦ",
            codeLabel: "Mã: {code} (+1 ✨ cả 2).",
            codePlaceholder: "Mã AWxxxx...",
            scanBtnAria: "Quét mã QR",
            btn: "XÁC NHẬN",
            btnLoading: "Đang kết nối...",
            success: "🎉 KẾT NỐI THÀNH CÔNG!\nBạn và [{friendName} - {friendCode}] đã kết nối thành công. Cả 2 đều được nhận +1 🔮 Tinh Quang!",
            invalidCode: "Vui lòng nhập đúng mã TINH THỦ (bắt đầu bằng AW, ví dụ: AW8391)!",
            error: "Không thể kết nối với mã này!",
            networkError: "Lỗi kết nối đến máy chủ!",
        },
        quiz: {
            cardTitle: "Mật Mã Tinh Linh",
            cardDesc: "Giải mã tri thức từ RỪNG TINH LINH +1 ✨ .",
            badge: "Hoàn thành 10 câu hỏi",
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
        defaultRole: "Tân Thủ",
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
                title: "THÀNH LẬP BANG HỘI",
                desc: "Quy chế lập Hội, quyền lợi thủ lĩnh.",
            },
            ranger: {
                title: "CHIÊU MỘ NPC & QUÁI RỪNG",
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
            desc: "Kích hoạt Khế Ước Google để bảo hộ Quang Thạch và Túi Đồ của bạn.",
            requiredNote: "*Bắt buộc để đồng bộ Thẻ",
        },
        step2: {
            title: "✦ THIẾT LẬP THẺ TINH THỦ ✦",
            labels: {
                name: "Danh tính Tinh Thủ:",
                gender: "Giới tính:",
                avatar: "Chọn hình đại diện ban đầu:",
                birth: "Sanh thần:",
                class: "Chức nghiệp:",
                tribe: "Chủng tộc:",
                phone: "ZépLào liên hệ:",
            },
            genderOptions: [
                "👨 Nam",
                "👩 Nữ",
                "🌈 Tự do"
            ],
            avatarNote: "*Có thể đổi ảnh cá nhân ở trang Hồ Sơ sau.",
            namePlaceholder: "Nhập biệt danh của bạn...",
            birthPlaceholder: "VD: 19xx",
            classPlaceholder: "VD: Hiệp sĩ mù, Pháp sư Sinh tố...",
            tribePlaceholder: "VD: Human, Elf, Orc...",
            phonePlaceholder: "VD: 0912345678",
            submitBtn: "✦ TIẾN VÀO LINH CẢNH ✦",
            validation: {
                name: "Vui lòng nhập Tên TINH THỦ!",
                phone: "Vui lòng nhập Số điện thoại hoặc Zalo!",
                birth: "Vui lòng nhập Năm sinh!",
                class: "Vui lòng nhập Chức nghiệp của bạn!",
                tribe: "Vui lòng nhập Chủng tộc của bạn!",
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
        note: "*Chúc phúc có hiệu lực khi tham gia phiêu lưu\n tại Rừng Tinh Linh!",
        shopBtn: "✦ KHÁM PHÁ GÓI TÂN THỦ 2N1Đ ✦",
        closeBtn: "CẤT VÀO TÚI ĐỒ",
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
        // Locked state texts (dùng khi đá chưa mở khóa - hiển thị trong inventory grid)
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
        title: "​📜 THÀNH LẬP BANG HỘI GUILD",
        registerBtn: "✦ ĐĂNG KÝ THÀNH LẬP BANG ✦",
    },

    // ======================================================
    // RANGER MODAL
    // ======================================================
    ranger: {
        title: "🏹 CHIÊU MỘ NPC & QUÁI RỪNG </br> ​HỘI MẠO HIỂM NGỌC LỤC",
        applyBtn: "✦ NỘP HỒ SƠ NPC✦",
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