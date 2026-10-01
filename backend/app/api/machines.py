from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schemas import MachineCreate, MachineUpdate, MachineResponse
from app.services import crud

router = APIRouter(prefix="/machines", tags=["Machines"])


@router.post("/", response_model=MachineResponse, status_code=status.HTTP_201_CREATED)
def create_machine_endpoint(machine_in: MachineCreate, db: Session = Depends(get_db)):
    """Добавить новую единицу оборудования (стиралку или сушилку)."""
    return crud.create_machine(db=db, machine_in=machine_in)


@router.get("/", response_model=List[MachineResponse])
def get_machines_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Получить список всех машин."""
    if skip < 0 or limit <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Параметры пагинации некорректны: skip >= 0, limit > 0"
        )
    return crud.get_machines(db=db, skip=skip, limit=limit)


@router.get("/{machine_id}", response_model=MachineResponse)
def get_machine_endpoint(machine_id: int, db: Session = Depends(get_db)):
    """Получить оборудование по ID."""
    machine = crud.get_machine(db=db, machine_id=machine_id)
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Оборудование с ID={machine_id} не найдено"
        )
    return machine


@router.put("/{machine_id}", response_model=MachineResponse)
def update_machine_endpoint(machine_id: int, machine_in: MachineUpdate, db: Session = Depends(get_db)):
    """Обновить параметры или статус оборудования."""
    machine = crud.get_machine(db=db, machine_id=machine_id)
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Оборудование с ID={machine_id} не найдено"
        )
    return crud.update_machine(db=db, machine=machine, machine_in=machine_in)


@router.delete("/{machine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_machine_endpoint(machine_id: int, db: Session = Depends(get_db)):
    """Удалить оборудование."""
    machine = crud.get_machine(db=db, machine_id=machine_id)
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Невозможно удалить: оборудование с ID={machine_id} не найдено"
        )
    crud.delete_machine(db=db, machine=machine)
    return None