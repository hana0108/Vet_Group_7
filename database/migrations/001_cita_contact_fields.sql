ALTER TABLE citas
    ADD COLUMN telefono_contacto VARCHAR(10) NULL AFTER fecha_hora,
    ADD COLUMN observaciones TEXT NULL AFTER telefono_contacto;