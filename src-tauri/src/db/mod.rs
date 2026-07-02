pub mod repository;
pub mod schema;

use rusqlite::{Connection, Result};

pub fn init_db(app_dir: &std::path::Path) -> Result<Connection> {
    let db_path = app_dir.join("revolution.db");
    let conn = Connection::open(&db_path)?;

    // Configurações de performance para SQLite
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;
         PRAGMA synchronous = NORMAL;
         PRAGMA foreign_keys = ON;",
    )?;

    schema::create_tables(&conn)?;

    Ok(conn)
}
