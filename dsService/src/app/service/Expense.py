from pydantic import BaseModel, Field
from typing import Optional

class Expense(BaseModel):
    amount: Optional[str] = Field(title="expense", description = "Expense amount", default=None)
    merchant: Optional[str] = Field(title="merchant", description = "Expense merchant", default=None)
    currency: Optional[str] = Field(title="currency", description = "Expense currency", default=None)
    
    