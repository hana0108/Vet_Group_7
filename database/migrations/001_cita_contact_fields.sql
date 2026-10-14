SET @migration_sql = IF(
    (
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'citas'
          AND COLUMN_NAME = 'telefono_contacto'
    ) = 0,
    'ALTER TABLE citas ADD COLUMN telefono_contacto VARCHAR(10) NULL AFTER fecha_hora',
    'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;

SET @migration_sql = IF(
    (
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'citas'
          AND COLUMN_NAME = 'observaciones'
    ) = 0,
    'ALTER TABLE citas ADD COLUMN observaciones TEXT NULL AFTER telefono_contacto',
    'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;
