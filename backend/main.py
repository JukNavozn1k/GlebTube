from fastapi import FastAPI
from fastapi.responses import ORJSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from contextlib import asynccontextmanager

from core import settings, logger
from api import router as api_router

from models import mongo  
@asynccontextmanager
async def lifespan(app: FastAPI):
    await mongo.init() 
    yield
    await mongo.dispose()


app = FastAPI(title=settings.app.title, version=settings.app.version, lifespan=lifespan)
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.app.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, default_response_class=ORJSONResponse)

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code} {request.url}")
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return ORJSONResponse(status_code=500, content={"detail": "Internal Server Error"})