package org.example.dto;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;

import java.sql.Timestamp;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@JsonNaming(PropertyNamingStrategy.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExpenseDto {
    private String externalId;

    @JsonProperty(value = "amount")
    private java.math.BigDecimal amount;

    @JsonProperty(value = "user_Id")
    private String userId;

    @JsonProperty(value = "merchant")
    private String merchant;

    @JsonProperty(value = "currency")
    private String currency;

    @JsonProperty(value = "created_at")
    private Timestamp createdAt;

    public ExpenseDto(String json){
        try{
            ObjectMapper mapper = new ObjectMapper();
            mapper.setPropertyNamingStrategy(PropertyNamingStrategy.SNAKE_CASE);
            ExpenseDto expenseDto = mapper.readValue(json, ExpenseDto.class);
            this.externalId = expenseDto.externalId;
            this.amount = expenseDto.amount;
            this.userId = expenseDto.userId;
            this.merchant = expenseDto.merchant;
            this.currency = expenseDto.currency;
            this.createdAt = expenseDto.createdAt;
        }catch(Exception e){
            throw new RuntimeException("Failed to parse JSON");
        }
    }
}
