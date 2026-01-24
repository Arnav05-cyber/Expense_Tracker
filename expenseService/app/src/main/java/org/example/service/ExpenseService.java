package org.example.service;

import com.fasterxml.jackson.core.type.TypeReference;import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import org.apache.logging.log4j.util.Strings;import org.example.dto.ExpenseDto;import org.example.entity.ExpenseEntity;import org.example.repo.ExpenseRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;import javax.swing.text.html.Option;import java.lang.reflect.Type;import java.util.List;import java.util.Objects;import java.util.Optional;

import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class ExpenseService {

    private ExpenseRepo expenseRepo;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    ExpenseService(ExpenseRepo expenseRepo){
        this.expenseRepo = expenseRepo;
    }

    public boolean createExpense(ExpenseDto expenseDto){
        setCurrency(expenseDto);
        expenseRepo.save(objectMapper.convertValue(expenseDto, ExpenseEntity.class));
        return true;
    }

    public boolean updateExpense(ExpenseDto expenseDto){
        Optional<ExpenseEntity> expenseFound = expenseRepo.findByUserIdAndExternalId(expenseDto.getUserId(), expenseDto.getExternalId());
        if(expenseFound.isEmpty()){
            return false;
        }
        ExpenseEntity expense = expenseFound.get();
        expense.setCurrency(Strings.isNotBlank(expenseDto.getCurrency()) ? expenseDto.getCurrency(): expense.getCurrency());
        expense.setMerchant(Strings.isNotBlank(expenseDto.getMerchant())? expenseDto.getMerchant(): expense.getMerchant());
        expense.setAmount(expenseDto.getAmount());
        expenseRepo.save(expense);
        return true;
    }

    public List<ExpenseDto> getExpense(String userId) {
        List<ExpenseEntity> expenseList = expenseRepo.findByUserId(userId);
        return objectMapper.convertValue(expenseList, new TypeReference<List<ExpenseDto>>() {});
    }

    private void setCurrency(ExpenseDto expenseDto){
        if(Objects.isNull(expenseDto.getCurrency())){
            expenseDto.setCurrency("inr");
        }
    }

}
