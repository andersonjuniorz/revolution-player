use crate::models::Track;
use rusqlite::{params, Connection, Result};

pub struct TrackRepository<'a> {
    conn: &'a Connection,
}

impl<'a> TrackRepository<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    pub fn insert_track(&self, track: &Track) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO tracks (id, title, artist, album, duration, url, cover_url, bpm, key)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                track.id,
                track.title,
                track.artist,
                track.album,
                track.duration,
                track.url,
                track.cover_url,
                track.bpm,
                track.key,
            ],
        )?;
        Ok(())
    }

    pub fn get_track_by_url(&self, url: &str) -> Result<Option<Track>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, artist, album, duration, url, cover_url, bpm, key 
             FROM tracks WHERE url = ?1",
        )?;
        let mut rows = stmt.query(params![url])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Track {
                id: row.get(0)?,
                title: row.get(1)?,
                artist: row.get(2)?,
                album: row.get(3)?,
                duration: row.get(4)?,
                url: row.get(5)?,
                cover_url: row.get(6)?,
                bpm: row.get(7)?,
                key: row.get(8)?,
            }))
        } else {
            Ok(None)
        }
    }
}
