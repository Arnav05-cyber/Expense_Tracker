from pydantic import BaseModel, Field, validator
from typing import Optional

class Expense(BaseModel):
    amount: Optional[str] = Field(title="expense", description = "Expense amount", default=None)
    merchant: Optional[str] = Field(title="merchant", description = "Expense merchant", default=None)
    currency: Optional[str] = Field(title="currency", description = "Expense currency", default=None)

    @validator('amount', pre=True)
    def clean_amount(cls, v):
        if v and isinstance(v, str):
            import re
            return re.sub(r'[^\d.]', '', v)
        return v