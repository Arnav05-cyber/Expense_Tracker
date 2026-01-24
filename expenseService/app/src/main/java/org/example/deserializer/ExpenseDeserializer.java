package org.example.deserializer;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.common.serialization.Deserializer;
import org.example.dto.ExpenseDto;

import java.util.Map;

public class ExpenseDeserializer implements Deserializer<ExpenseDto> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void configure(Map<String, ?> configs, boolean isKey) {
        // no-op
    }

    @Override
    public ExpenseDto deserialize(String topic, byte[] data) {
        if (data == null) {
            return null;
        }

        try {
            return objectMapper.readValue(data, ExpenseDto.class);
        } catch (Exception e) {
            throw new RuntimeException("Error deserializing ExpenseDto", e);
        }
    }

    @Override
    public void close() {
        // no-op
    }
}
