from typing import List

from app.core.database import get_db
from app.models.application import Application
from app.schemas.application import Application as ApplicationSchema
from app.schemas.application import ApplicationCreate, ApplicationUpdate
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=List[ApplicationSchema])
def get_applications(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> List[Application]:
    """
    Get all applications with pagination.

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session

    Returns:
        List[Application]: List of applications
    """
    applications = db.query(Application).offset(skip).limit(limit).all()
    return applications


@router.post("/", response_model=ApplicationSchema)
def create_application(
    application: ApplicationCreate, db: Session = Depends(get_db)
) -> Application:
    """
    Create a new application.

    Args:
        application: Application data
        db: Database session

    Returns:
        Application: Created application
    """
    db_application = Application(**application.model_dump())
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


@router.get("/{application_id}", response_model=ApplicationSchema)
def get_application(application_id: int, db: Session = Depends(get_db)) -> Application:
    """
    Get a specific application by ID.

    Args:
        application_id: ID of the application
        db: Database session

    Returns:
        Application: Application data

    Raises:
        HTTPException: If application not found
    """
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.put("/{application_id}", response_model=ApplicationSchema)
def update_application(
    application_id: int, application: ApplicationUpdate, db: Session = Depends(get_db)
) -> Application:
    """
    Update an existing application.

    Args:
        application_id: ID of the application
        application: Updated application data
        db: Database session

    Returns:
        Application: Updated application

    Raises:
        HTTPException: If application not found
    """
    db_application = (
        db.query(Application).filter(Application.id == application_id).first()
    )
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")

    for key, value in application.model_dump(exclude_unset=True).items():
        setattr(db_application, key, value)

    db.commit()
    db.refresh(db_application)
    return db_application


@router.delete("/{application_id}")
def delete_application(application_id: int, db: Session = Depends(get_db)) -> dict:
    """
    Delete an application.

    Args:
        application_id: ID of the application
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException: If application not found
    """
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(application)
    db.commit()
    return {"message": "Application deleted successfully"}
