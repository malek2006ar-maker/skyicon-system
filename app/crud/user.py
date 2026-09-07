from typing import Optional

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
    q = select(User).where(User.email == email)
    res = await session.execute(q)
    return res.scalars().first()


async def create_user(session: AsyncSession, email: str, hashed_password: str) -> User:
    user = User(email=email, hashed_password=hashed_password)
    session.add(user)
    try:
        await session.commit()
        await session.refresh(user)
    except IntegrityError:
        await session.rollback()
        raise
    return user


async def get_user(session: AsyncSession, user_id: int) -> Optional[User]:
    q = select(User).where(User.id == user_id)
    res = await session.execute(q)
    return res.scalars().first()
