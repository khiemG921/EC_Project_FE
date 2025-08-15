USE e_commerce;

ALTER TABLE voucher
    ADD COLUMN IF NOT EXISTS used_count INT DEFAULT 0;