package com.arnav.userService.consumer;

import com.arnav.userService.entities.UserInfoDto;
import com.arnav.userService.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceConsumer {

    private UserRepository userRepository;

    @Autowired
    public AuthServiceConsumer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @KafkaListener(
            topics = "${spring.kafka.topic.name}",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void consumeMessage(
            @org.springframework.messaging.handler.annotation.Payload(required = false)
            UserInfoDto eventData
    ) {
        if (eventData == null) {
            System.out.println("⚠️ Received tombstone (null payload). Skipping.");
            return;
        }

        System.out.println("EVENT CONSUMED IN USER SERVICE: " + eventData);
        userRepository.save(eventData);
    }


}
