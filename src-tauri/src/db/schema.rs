use rusqlite::Connection;

pub fn create_tables(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tracks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            album TEXT NOT NULL,
            duration REAL NOT NULL,
            url TEXT NOT NULL UNIQUE,
            cover_url TEXT NOT NULL,
            bpm INTEGER,
            key TEXT
        )",
        (),
    )?;
    
    // Podemos adicionar mais tabelas no futuro (ex: playlists, relação track-playlist, etc.)

    Ok(())
}
