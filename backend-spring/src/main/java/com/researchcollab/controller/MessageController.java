package com.researchcollab.controller;

import com.researchcollab.model.Message;
import com.researchcollab.repository.MessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageRepository messageRepository;

    public MessageController(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @GetMapping
    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    @PostMapping
    public Message createMessage(@RequestBody Message message) {
        return messageRepository.save(message);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Message> getMessageById(@PathVariable Long id) {
        return messageRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Message> updateMessage(@PathVariable Long id, @RequestBody Message details) {
        return messageRepository.findById(id).map(message -> {
            if (details.getSender() != null) message.setSender(details.getSender());
            if (details.getProject() != null) message.setProject(details.getProject());
            if (details.getMessage() != null) message.setMessage(details.getMessage());
            if (details.getTime() != null) message.setTime(details.getTime());
            if (details.getType() != null) message.setType(details.getType());
            if (details.getStatus() != null) message.setStatus(details.getStatus());
            return ResponseEntity.ok(messageRepository.save(message));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        if (messageRepository.existsById(id)) {
            messageRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
