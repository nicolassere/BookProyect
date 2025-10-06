import requests
import pandas as pd
import time
import os
from dotenv import load_dotenv
from datetime import datetime

# 🔧 Cargar variables de entorno
load_dotenv()

# Configuración desde variables de entorno
USER = os.getenv("LASTFM_USER")
API_KEY = os.getenv("LASTFM_API_KEY")
LIMIT = 200  # máximo permitido por página
BASE_URL = "https://ws.audioscrobbler.com/2.0/"

def validate_config():
    """Valida que las credenciales estén configuradas"""
    if not USER or not API_KEY:
        print("❌ Error: Falta configuración.")
        print("\nCrea un archivo .env con:")
        print("LASTFM_USER=tu_usuario")
        print("LASTFM_API_KEY=tu_api_key")
        print("\nO define las variables de entorno LASTFM_USER y LASTFM_API_KEY")
        return False
    return True

def get_all_scrobbles(user, api_key, max_pages=None):
    """
    Descarga todos los scrobbles del usuario.
    
    Args:
        user (str): Usuario de Last.fm
        api_key (str): API key de Last.fm
        max_pages (int, optional): Número máximo de páginas a descargar
    
    Returns:
        list: Lista de diccionarios con información de cada scrobble
    """
    all_tracks = []
    page = 1
    total_pages = 1
    
    print(f"🎵 Descargando scrobbles de {user}...\n")
    
    while page <= total_pages:
        if max_pages and page > max_pages:
            print(f"\n⚠️ Alcanzado el límite de {max_pages} páginas")
            break
            
        params = {
            "method": "user.getRecentTracks",
            "user": user,
            "api_key": api_key,
            "format": "json",
            "limit": LIMIT,
            "page": page
        }
        
        try:
            response = requests.get(BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if "recenttracks" not in data:
                print("❌ Error: Verificá tu usuario o API key.")
                if "error" in data:
                    print(f"   Mensaje: {data.get('message', 'Error desconocido')}")
                break
            
            tracks = data["recenttracks"]["track"]
            attr = data["recenttracks"]["@attr"]
            total_pages = int(attr.get("totalPages", 1))
            
            # Procesar tracks
            for track in tracks:
                # Saltar "Now Playing"
                if "@attr" in track and track["@attr"].get("nowplaying") == "true":
                    continue
                
                artist = track["artist"]["#text"] if isinstance(track["artist"], dict) else track["artist"]
                song = track["name"]
                album = track["album"]["#text"] if isinstance(track["album"], dict) else track["album"]
                url = track["url"]
                date_info = track.get("date", {})
                date = date_info.get("#text", "") if isinstance(date_info, dict) else ""
                timestamp = date_info.get("uts", "") if isinstance(date_info, dict) else ""
                
                all_tracks.append({
                    "artist": artist,
                    "song": song,
                    "album": album,
                    "date": date,
                    "timestamp": timestamp,
                    "url": url
                })
            
            # Mostrar progreso
            print(f"📥 Página {page}/{total_pages} ({len(all_tracks)} tracks)", end="\r")
            
            page += 1
            time.sleep(0.25)  # Rate limiting
            
        except requests.exceptions.RequestException as e:
            print(f"\n❌ Error de conexión: {e}")
            print("⏸️ Reintentando en 5 segundos...")
            time.sleep(5)
            continue
        except Exception as e:
            print(f"\n❌ Error inesperado: {e}")
            break
    
    print(f"\n")  # Nueva línea después del progreso
    return all_tracks

def save_to_csv(scrobbles, filename=None):
    """
    Guarda los scrobbles en un archivo CSV.
    
    Args:
        scrobbles (list): Lista de scrobbles
        filename (str, optional): Nombre del archivo de salida
    """
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"lastfm_scrobbles_{timestamp}.csv"
    
    df = pd.DataFrame(scrobbles)
    
    # Ordenar por fecha (más reciente primero)
    if "timestamp" in df.columns and not df["timestamp"].isna().all():
        df["timestamp"] = pd.to_numeric(df["timestamp"], errors="coerce")
        df = df.sort_values("timestamp", ascending=False)
    
    df.to_csv(filename, index=False, encoding="utf-8-sig")
    return filename

def print_stats(scrobbles):
    """Muestra estadísticas básicas de los scrobbles"""
    if not scrobbles:
        return
    
    df = pd.DataFrame(scrobbles)
    
    print("📊 Estadísticas:")
    print(f"   Total de scrobbles: {len(df):,}")
    print(f"   Artistas únicos: {df['artist'].nunique():,}")
    print(f"   Canciones únicas: {df['song'].nunique():,}")
    
    print("\n🎤 Top 5 Artistas:")
    top_artists = df['artist'].value_counts().head(5)
    for i, (artist, count) in enumerate(top_artists.items(), 1):
        print(f"   {i}. {artist} ({count:,} reproducciones)")
    
    print("\n🎵 Top 5 Canciones:")
    top_songs = df.groupby(['artist', 'song']).size().sort_values(ascending=False).head(5)
    for i, ((artist, song), count) in enumerate(top_songs.items(), 1):
        print(f"   {i}. {artist} - {song} ({count:,} reproducciones)")

def main():
    """Función principal"""
    if not validate_config():
        return
    
    print("=" * 60)
    print("🎧 Last.fm Scrobble Downloader")
    print("=" * 60)
    
    # Descargar scrobbles
    scrobbles = get_all_scrobbles(USER, API_KEY)
    
    if not scrobbles:
        print("⚠️ No se descargaron scrobbles")
        return
    
    # Guardar en CSV
    filename = save_to_csv(scrobbles)
    print(f"✅ Guardado: {filename}")
    
    # Mostrar estadísticas
    print_stats(scrobbles)
    
    print("\n" + "=" * 60)
    print("✨ ¡Proceso completado!")
    print("=" * 60)

if __name__ == "__main__":
    main()