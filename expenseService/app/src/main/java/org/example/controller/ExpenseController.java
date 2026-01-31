package org.example.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import lombok.NonNull;
import org.example.dto.ExpenseDto;
import org.example.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController

public class ExpenseController {
    private final ExpenseService expenseService;

    @Autowired
    ExpenseController(ExpenseService expenseService){
        this.expenseService = expenseService;
    }

    @GetMapping("/expense/v1/{userId}")
    public ResponseEntity<List<ExpenseDto>> getExpenses(@PathVariable("userId") @NonNull String userId){
        List<ExpenseDto> expenseList = expenseService.getExpense(userId);
        return ResponseEntity.ok(expenseList);
    }

    @PostMapping("/expense/v1/create")
    public ResponseEntity<String> createExpense(@RequestBody @NonNull ExpenseDto expenseDto){
        boolean isCreated = expenseService.createExpense(expenseDto);
        if (isCreated) {
            return ResponseEntity.ok("Expense created successfully");
        } else {
            return ResponseEntity.status(500).body("Failed to create expense");
        }
    }

    @PostMapping("/expense/v1/update")
    public ResponseEntity<String> updateExpense(@RequestBody @NonNull ExpenseDto expenseDto) {
        boolean isUpdated = expenseService.updateExpense(expenseDto);
        if (isUpdated) {
            return ResponseEntity.ok("Expense updated successfully");
        } else {
            return ResponseEntity.status(404).body("Expense not found");
        }
    }

    @PostMapping("/addExpense")
    public ResponseEntity<Boolean> addExpense(@RequestHeader(value="X-user-id") @NonNull String userId, ExpenseDto expenseDto){
        try{
            expenseDto.setUserId(userId);
            return new ResponseEntity<>(expenseService.createExpense(expenseDto), HttpStatus.OK);
        } catch(Exception e){
            return ResponseEntity.status(500).body(false);
        }
    }
}
