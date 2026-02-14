package org.example.consumer;

import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.example.dto.ExpenseDto;
import org.example.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseConsumer {

    private ExpenseService expenseService;

    @Autowired
    ExpenseConsumer(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @KafkaListener(topics = "${spring.kafka.topic.name}", groupId = "${spring.kafka.consumer.group-id}")
    public void listen(ExpenseDto expenseDto) {
        log.info("Received expense: {}", expenseDto);
        log.info("Extracted User ID: {}", expenseDto.getUserId());
        expenseService.createExpense(expenseDto);
    }

}
