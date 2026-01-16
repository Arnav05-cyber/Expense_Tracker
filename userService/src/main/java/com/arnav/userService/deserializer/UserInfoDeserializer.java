package com.arnav.userService.deserializer;

import com.arnav.userService.entities.UserInfoDto;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.kafka.common.serialization.Deserializer;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

public class  UserInfoDeserializer implements Deserializer<UserInfoDto> {

    @Override
    public void configure(Map<String, ?> configs, boolean isKey) {
        // No configuration needed
    }

    @Override
    public UserInfoDto deserialize(String topic, byte[] data) {
        if (data == null || data.length == 0) {
            return null; // IMPORTANT
        }

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(data, UserInfoDto.class);
        } catch (Exception e) {
            throw new RuntimeException("Error deserializing UserInfoDto", e);
        }
    }

    @Override
    public void close() {
        // No resources to close
    }

}
