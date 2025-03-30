from app.api.v1.endpoints import applications, auth
from app.core.config import settings
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(
    title="JobPal API",
    description="API for JobPal - Job Search Management Application",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        ["*"] if settings.DEBUG else ["http://localhost:1235"]
    ),  # Allow all origins in debug mode
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(
    applications.router, prefix="/api/v1/applications", tags=["applications"]
)


# Error handling
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


@app.get("/")
async def root():
    return {"message": "Welcome to JobPal API"}
