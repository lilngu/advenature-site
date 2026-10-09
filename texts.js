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
        title: "RỪNG TINH LINH ADVENATURE",
        scrollBgAlt: "Cuộn Thư Tinh Linh",
    },

    // ======================================================
    // WELCOME SCROLL BANNER
    // ======================================================
    welcome: {
        title: "✦ ĐANG KHỞI TẠO CỔNG DỊCH CHUYỂN ... ✦",
        body: "Chào mừng đến LINH CẢNH KHỞI NGUYÊN! <br> Cổng kết nối giữa Tinh Linh🍀 <br> dành cho các Nhà Phiêu Lưu Xanh. <br> Chạm TINH CẦU nhận CHÚC PHÚC<br> Sẵn sàng cho hành trình nhập vai vui vẻ tại RỪNG TINH LINH. </br> ⋆｡‧˚ʚ🔮ɞ˚‧｡⋆",
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
        tooltip: "HƯỚNG DẪN TÂN THỦ",
    },

    // ======================================================
    // LORE READER MODAL
    // ======================================================
    loreReader: {
        title: "✦Advenature Chronicles✦",
        prevBtn: "TRƯỚC",
        nextBtn: "TIẾP",
    },

    // ======================================================
    // GUIDE READER MODAL (Hướng dẫn NHÀ PHIÊU LƯU)
    // ======================================================
    guideReader: {
        title: "✦ HƯỚNG DẪN TÂN THỦ ✦",
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
        tabIndicator: "✧LINH CẢNH✦ \n CỔNG KẾT NỐI TINH LINH",
        crystalTitleDefault: "Bệ Đá Tinh Quang",
        claimButton: "✦ THU THẬP VÀO TÚI ✦",
        collectBanner: "ĐÃ THU THẬP QUANG THẠCH VÀO TÚI",
        lootTitlePrefix: "✦ ",
        lootTitleSuffix: " ✦",
        lootMetaTemplate: "[{shapeName}] • {faceCount} DIỆN THỂ • MÃ: {code}",
        readyTooltip: "Sẵn sàng Gacha",
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
        panelTitle: "✦ TÚI VẬT PHẨM ✦",
        tabs: {
            gems: "✦ Quang Thạch ({count}/990)",
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
    // PLAYER INFO MODAL
    // ======================================================
    playerInfo: {
        class: "Chức nghiệp",
        tribe: "Dòng Máu",
        congHien: "Cống Hiến",
        gemCount: "Quang Thạch",
        badge: "Danh hiệu",
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
            cardDesc: "Đăng nhập mỗi ngày để duy trì kết nối với\n Linh Cảnh.\n +1 ✨ Tinh Quang",
            btn: "KÍCH HOẠT ĐIỂM DANH",
            btnLoading: "Đang kiểm tra...",
            btnDone: "Đã Điểm Danh",
            successDaily: "✦ Điểm danh thành công! Nhận +1 ✨ Tinh Quang.",
            successStreak7: "🎉 XUẤT SẮC! Đạt mốc chuỗi 7 ngày liên tục! Thưởng thêm +1 ✨.",
            error: "Không thể điểm danh!",
            networkError: "Lỗi kết nối máy chủ điểm danh!",
        },
        fbShare: {
            cardTitle: "💬 NHÀ SƯU TẦM QUANG THẠCH",
            cardDesc: "Gửi hình ảnh Quang Thạch mà bạn Gacha được lên FB Group Advenature,\n dán link nhận +1 ✨.",
            inputPlaceholder: "Link bài viết...",
            btn: "CHIA SẺ",
            btnLoading: "Đang gửi...",
            success: "✦ Đã gửi link bài viết cho Trưởng Hội! Vui lòng chờ duyệt (+1 🔮).",
            error: "Thử lại sau!",
            invalidUrl: "Vui lòng nhập đường link bài viết hợp lệ (bắt đầu bằng http...)!",
            networkError: "Không thể kết nối đến máy chủ duyệt nhiệm vụ!",
        },
        referral: {
            cardTitle: "KẾT NỐI NHÀ PHIÊU LƯU",
            codeLabel: "Mã: {code}\n ( chia sẻ bạn bè \n +1 ✨ Tinh Quang cho cả 2).",
            codePlaceholder: "Nhập Mã của bạn bè AWxxxx...",
            scanBtnAria: "Quét mã QR",
            btn: "XÁC NHẬN",
            btnLoading: "Đang kết nối...",
            success: "🎉 KẾT NỐI THÀNH CÔNG!\nBạn và [{friendName} - {friendCode}] đã kết nối thành công. Cả 2 đều được nhận +1 🔮 Tinh Quang!",
            invalidCode: "Vui lòng nhập đúng mã PHIÊU LƯU (bắt đầu bằng AW, ví dụ: AW8391)!",
            error: "Không thể kết nối với mã này!",
            networkError: "Lỗi kết nối đến máy chủ!",
        },
        quiz: {
            cardTitle: "Mật Mã Tinh Linh",
            cardDesc: "Giải mã tri thức từ \n RỪNG TINH LINH \n +1 ✨ .",
            badge: "Hoàn thành 10 câu hỏi",
            btn: "Giải Mã",
        },
        rollQuest: {
            cardTitle: "NHẬP VAI VUI VẺ",
            cardDesc: "Tung Dice để Nhập Vibe.\n Mỗi lượt hoàn thành\n +1 ✨ Tinh Quang.",
            badge: "Tối đa 3 lượt mỗi ngày",
            btn: "NHẬP VAI THÔI",
            btnLoading: "Đang xem thẻ bài...",
            quotaUsed: "Còn {remaining} lượt nhập vai hôm nay",
            exhausted: "Hôm nay bạn đã nhập vai đủ 3 lần rồi! Quay lại vào ngày mai nhé.",
            networkError: "Lỗi kết nối máy chủ nhiệm vụ!",
            rewardFail: "Chưa nhận được thưởng: {error}",
            rewardedAlready: "Lượt này bạn đã nhận thưởng rồi! Thử nhập vai tình huống khác nhé.",
            rewardNote: "  (+1 ✨ Tinh Quang)",
            rewardNoteAlready: "  (Lượt này đã nhận thưởng)",
            noScenario: "Chưa có kịch bản nhập vai nào được nạp!",
        },
        loreQuest: {
            cardTitle: "𓍢ִ໋🧚🏻KHU VƯỜN TINH LINH🐞",
            cardDesc: "NƠI NHÀ PHIÊU LƯU CHĂM SÓC TINH LINH VÀ KHU VƯỜN CỦA MÌNH",
            btn: "KHÁM PHÁ",
            lockedToast: "CHƯA MỞ KHOÁ!",
        },
        backBtnAria: "Trở về",
    },

    // ======================================================
    // SHOP PANEL
    // ======================================================
    shop: {
        panelTitle: "🛒 THƯƠNG QUÁN EMERALD",
        subtitle: "Đổi Tinh Thạch (1💎 ~ 25 🐟) ⬩➤ Kích Hoạt Phiên Chợ Tinh Linh! \n 🎏Phiên chợ LARP nhập vai diễn ra 2N1Đ cuối tuần \n ▶ tại Rừng Tinh Linh ▸ ngoại ô thành phố Bảo Lộc ◀",
        priceTemplate: "💎 {tt} Tinh Thạch (~{vnd} đ)",
        checkout: {
            count: "Đã chọn: {count} mục",
            total: "Tổng: {tt} 💎 (~{vnd} đ)",
            btn: "✦ TA MUỐN THAM GIA, GỬI TIN CHO HỘI! ✦",
        },
        scheduleBtn: {
            badge: "SỰ KIỆN LARP CAMP",
            title: "📅LỊCH PHIÊN CHỢ LARP",
            desc: "Xem lịch mở Cổng Dịch Chuyển & số lượng Nhà Phiêu Lưu gia nhập. \n Chốt lịch đăng ký mạo hiểm giả trước 3 ngày tổ chức.",
            cta: "✦ Tối thiểu 5 Nhà Phiêu Lưu tham gia ✦",
        },
        brochureBtn: {
            badge: "📖 ",
            title: "📜Sự kiện ADVENATURE LARP ",
            desc: "Khám phá cốt truyện chính tại Rừng Tinh Linh.\n Chỉ diễn ra khi các tinh linh rừng gửi thông điệp. ",
            cta: "Xem ngay →",
        },
        scheduleNote: "*Sở hữu ít nhất 1 Gói trong túi để đăng ký giữ chỗ chính thức.",
        checkoutSuccess: "✦ Thông tin đơn hàng đã gửi tới Hội Ngọc Lục! Trưởng đoàn sẽ liên hệ sớm nhất qua SĐT/Zalo.",
        checkoutError: "Vui lòng chạm chọn ít nhất 1 gói bất kì!",
    },

    // ======================================================
    // PROFILE PANEL
    // ======================================================
    profile: {
        panelTitle: "✦THẺ NHÀ PHIÊU LƯU XANH",
        uploadBadgeTitle: "Đổi ảnh đại diện",
        defaultCode: "AW----",
        defaultName: "NHÀ PHIÊU LƯU",
        defaultEmail: "chua_lien_ket@advenature.local",
        defaultRole: "Tân Thủ",
        defaultClass: "Chưa có",
        defaultTribe: "Tự do",
        defaultGender: "Nam",
        defaultBirth: "----",
        infoLabels: {
            class: "Chức Nghiệp",
            tribe: "Dòng máu",
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
            quangThach: "Quang Thạch",
            congHien: "Cống Hiến",
        },
        rank: {
            label: "Cấp Bậc: {title}",
            need: "{need} Điểm Lên Cấp",
            defaultTitle: "Tân Thủ",
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
            title: "✦ ĐỊNH DANH NHÀ PHIÊU LƯU ✦",
            desc: "Kích hoạt Khế Ước Google để bảo hộ Quang Thạch và Túi Đồ của bạn.",
            requiredNote: "*Bắt buộc để đồng bộ Thẻ",
        },
        step2: {
            title: "✦ THIẾT LẬP THẺ NHÀ PHIÊU LƯU ✦",
            labels: {
                name: "Danh tính NHÀ PHIÊU LƯU:",
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
                name: "Vui lòng nhập Tên NHÀ PHIÊU LƯU!",
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
    // GEM MILESTONE MODAL (MỐC SƯU TẦM MỖI 33 BIẾN THỂ)
    // ======================================================
    gemMilestone: {
        tag: "MỐC {milestone}/990",
        title: "ĐẠT MỐC SƯU TẦM QUANG THẠCH!",
        desc: "Bạn đã sưu tầm đủ {milestone} biến thể Quang Thạch!\nHội Ngọc Lục tặng bạn {reward} đã được cộng vào Túi Đồ.",
        note: "*Tiến trình sưu tầm: {current}/990\n Mỗi mốc 33 biến thể nhận 1 phiếu quà tặng!",
        closeBtn: "✧ NHẬN VÀO TÚI ĐỒ ✧",
    },

    // ======================================================
    // QUIZ MODAL
    // ======================================================
    quiz: {
        title: "✦ MẬT MÃ RỪNG TINH LINH",
        questionLabel: "Câu hỏi: {question}",
    },

    // ======================================================
    // QUEST NHẬP VAI VUI VẺ (MODULE RPG ROLL D20)
    // ======================================================
    rollQuest: {
        introTitle: "NHẬP VAI VUI VẺ",
        introDesc: "Bạn sẽ nhập vai một tình huống ngẫu nhiên và tung Xí Ngầu tối đa 3 lần.\nĐạt đủ 2 lần thành công để hoàn thành nhiệm vụ và nhận +1 ✨ Tinh Quang!\nMỗi ngày có tối đa 3 lượt - thắng lượt nào được thưởng lượt đó!",
        startBtn: "NHẬP VAI THÔI!",
        rollBtn: "🎲 TUNG XÍ NGẦU",
        thresholdLabel: "Thử thách: Roll ≥ {threshold}",
        trackerLabel: "Lượt: {attempts}/{max} (Đạt: {success}/{required})",
        winTitle: "NHIỆM VỤ HOÀN THÀNH!",
        winMessage: "Tuyệt vời! Bạn đạt <b>{success}/{max}</b> lần thành công và đã hoàn thành <b>{title}</b>!",
        failTitle: "NHIỆM VỤ THẤT BẠI!",
        failMessage: "Bạn chỉ đạt <b>{success}/{max}</b> lần thành công (yêu cầu tối thiểu {required}). Lần sau sẽ may hơn!",
        btnAgain: "NHẬP VAI LẦN NỮA",
        btnClose: "RỜI ĐI",
        btnExit: "THOÁT",
        waitReward: "Đang nhận thưởng...",
    },

    // ======================================================
    // GEM PREVIEW MODAL
    // ======================================================
    gemPreview: {
        // Locked state texts (dùng khi đá chưa mở khóa - hiển thị trong inventory grid)
        lockedTitle: "Quang Thạch Ẩn Danh",
        lockedShape: "Chưa khám phá",
        lockedFaces: "?? Mặt",
        lockedDesc: "Biến thể huyền bí này chưa được khai mở. Hãy triệu hồi tại Bệ Đá Tinh Quang để thu thập vào bộ sưu tập!",
    },

    // ======================================================
    // ADMIN MODAL
    // ======================================================
    admin: {
        title: "⚡ MASTER MODE",
        actions: {
            addTQ: "+99 🔮 Tinh Quang",
            addCH: "+100 🛡️ Cống Hiến",
            unlockAllGems: "🔓 Mở Khóa Đủ 990 Đá",
            addAllItems: "🎒 Thêm Đủ 30 Chúc Phúc Vào Túi",
            toggleFastGacha: "⚡ Fast Gacha: TẮT",
            resetData: "⚠️ Thoát Tài Khoản",
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
        title: "✦ LỊCH TRÌNH SỰ KIỆN LARP CAMP ✦",
        events: [
            {
                date: "10-11 Tháng 10",
                title: "HỘI TRIỆU HỒI - DÀNH CHO THƯƠNG NHÂN VÀ NPC",
                location: "Địa điểm: Rừng Tinh Linh",
                slots: "Đã đóng",
            },
            {
                date: "24-25 Tháng 10",
                title: "PHIÊN CHỢ NHẬP VAI L.A.R.P",
                location: "Địa điểm: Rừng Tinh Linh",
                slots: "0/15 chỗ",
            },
            {
                date: "Chưa cập nhật",
                title: "chưa cập nhật",
                location: "chưa cập nhật",
                slots: "--/-- chỗ",
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
        uploadFailed: "Kiểm tra lại API Key!",
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
    // UPCOMING FEATURES MODAL (CHỜ MỞ KHOÁ)
    // ======================================================
    upcomingFeatures: {
        title: "CHỜ MỞ KHOÁ",
        subtitle: "Các khu vực mới đang được Rừng Tinh Linh gia cố, sắp xuất hiện!",
        note: "✧ Hãy cùng chờ nhé! ✧",
        items: [
            { icon: "🏰", name: "GUILD HALL", desc: "nơi Nhà phiêu lưu họp hội giao lưu." },
            { icon: "🏆", name: "LEADERBOARD", desc: "Bảng danh sách top những Nhà phiêu lưu TOP Cống Hiến." },
            { icon: "💎", name: "QUANG THẠCH RANK", desc: "Bảng danh sách top Nhà Phiêu Lưu sưu tầm Quang Thạch." },
            { icon: "🌿", name: "KHU VƯỜN TINH LINH", desc: "nơi nhà phiêu lưu chill chăm sóc Tinh Linh và trồng Linh Thảo." }
        ]
    },

    // ======================================================
    // COMMON / SHARED
    // ======================================================
    common: {
        close: "Đóng",
        timesSymbol: "x",
        avatarAlt: "Avatar",
    },
};

// Global exposure for non-module scripts
if (typeof window !== 'undefined') {
    window.TEXTS = TEXTS;
}