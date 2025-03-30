from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base schema for user data."""

    email: EmailStr = Field(..., description="User's email address")
    full_name: Optional[str] = Field(None, description="User's full name")
    is_active: bool = Field(default=True, description="Whether the user is active")
    is_superuser: bool = Field(
        default=False, description="Whether the user is a superuser"
    )


class UserCreate(UserBase):
    """Schema for creating a new user."""

    password: str = Field(..., description="User's password", min_length=8)


class UserUpdate(UserBase):
    """Schema for updating an existing user."""

    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, description="User's password", min_length=8)


class User(UserBase):
    """Schema for user response."""

    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        """Pydantic config."""

        from_attributes = True


class UserInDB(User):
    """Schema for user in database."""

    hashed_password: str
