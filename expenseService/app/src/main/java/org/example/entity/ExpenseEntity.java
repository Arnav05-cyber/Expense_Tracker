package org.example.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties (ignoreUnknown = true)
@Entity
public class ExpenseEntity {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "external_id")
    private String externalId;

    @Column(name = "user_id")
    private String userId;

    @NonNull
    @Column(name = "amount")
    private java.math.BigDecimal amount;

    @Column(name = "merchant")
    private String merchant;

    @Column(name = "currency")
    private String currency;

    @Column(name = "created_at")
    private java.sql.Timestamp createdAt;

    @PrePersist
    @PreUpdate
    private void generateId() {
        if (this.externalId == null) {
            this.externalId = java.util.UUID.randomUUID().toString();
        }
    }

}
