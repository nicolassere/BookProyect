from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import authors, books, export, goals


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Book Reading Tracker API",
    description="REST API for the Book Reading Tracker – persists data in SQLite and serves downloadable exports.",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the Vite dev server and common prod ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router, prefix="/api/books", tags=["Books"])
app.include_router(authors.router, prefix="/api/authors", tags=["Authors"])
app.include_router(goals.router, prefix="/api/goals", tags=["Goals"])
app.include_router(export.router, prefix="/api", tags=["Import / Export"])


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "version": "1.0.0"}


# Run with:  uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
