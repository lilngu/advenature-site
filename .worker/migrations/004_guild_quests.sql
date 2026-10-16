-- 004: Guild Quests dong cho GUILD_QUEST_DATA + config META
-- Tuong thich nguoc: frontend fallback data.js khi bang chua migrate.

CREATE TABLE IF NOT EXISTS guild_quests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  messenger_url TEXT NOT NULL DEFAULT '',
  active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guild_quest_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Seed tu data.js hien tai (giu nguyen id/title/link de Telegram log nhat quan)
INSERT OR IGNORE INTO guild_quests (id, title, image_url, messenger_url, active, sort_order) VALUES
('1', 'SỰ KIỆN L.A.R.P CAMP & LỬA KHỞI NGUYÊN', 'https://res.cloudinary.com/aurorawoods/image/upload/t_mediumWebP/v1792054924/tnrmj3aoh6gm7qf6kkj3.png', 'https://m.me/463539600777112?text=Xin%20ch%C3%A0o%20H%E1%BB%99i%20Ng%E1%BB%8Dc%20L%E1%BB%A5c!%20T%C3%B4i%20mu%E1%BB%91n%20tham%20gia%20Phi%C3%AAn%20Ch%E1%BB%A3%20LARP%20%26%20L%E1%BB%ADa%20Kh%E1%BB%9Fi%20Nguy%C3%AAn%20ng%C3%A0y%2024-25%2F10!', 1, 1),
('2', 'Quest · TUYỂN CRAFTER', 'https://res.cloudinary.com/aurorawoods/image/upload/t_mediumWebP/v1792068594/kdfkdk4ktsh6hvbbgzvt.png', 'https://m.me/463539600777112?text=Xin%20ch%C3%A0o%20H%E1%BB%99i%20Ng%E1%BB%8Dc%20L%E1%BB%A5c!%20T%C3%B4i%20mu%E1%BB%91n%20nh%E1%BA%ADn%20Quest%20v%E1%BA%BD%20C%E1%BB%9D%20t%E1%BA%A1i%20C%C4%83n%20c%E1%BB%A9%20H%E1%BB%99i.', 1, 2),
('3', 'Quest · DRUID MIHO-SAN', 'https://res.cloudinary.com/aurorawoods/image/upload/t_mediumWebP/v1792144156/awmgduhv2zhq1fwill7q.png', 'https://m.me/463539600777112?text=Xin%20ch%C3%A0o%20H%E1%BB%99i%20Ng%E1%BB%8Dc%20L%E1%BB%A5c!%20T%C3%B4i%20mu%E1%BB%91n%20nh%E1%BA%ADn%20Quest%20h%C3%A1i%20th%E1%BA%A3o%20d%C6%B0%E1%BB%A3c%20cho%20Druid%20Miho-San.', 1, 3),
('4', 'Quest · Thương Hội', 'https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791046797/ukoqthjxzapum1snkxwg.png', 'https://m.me/463539600777112', 1, 4),
('5', 'Quest II · Hội Ngọc Lục', 'https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791043557/l2gwcmzyz050izqlfye3.png', 'https://m.me/463539600777112', 1, 5);

INSERT OR IGNORE INTO guild_quest_config (key, value) VALUES
('title', 'BẢNG NHIỆM VỤ HỘI NGỌC LỤC'),
('background', 'https://res.cloudinary.com/aurorawoods/image/upload/t_optimzeWebP/v1791043559/rgaguy1x4tqh7atwi663.png'),
('maxTiltDeg', '30'),
('emptyText', 'Hội Ngọc Lục đang sắp xếp các tờ Quest…'),
('messenger_default', 'https://m.me/463539600777112');

CREATE INDEX IF NOT EXISTS idx_guild_quests_active_sort ON guild_quests(active, sort_order);
