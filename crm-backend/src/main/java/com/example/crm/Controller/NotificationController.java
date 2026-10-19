package com.example.crm.Controller;

import com.example.crm.entity.Notification;
import com.example.crm.repository.NotificationRepository;
import com.example.crm.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/notifications", "/api/admin/notifications"})
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final PasswordResetService passwordResetService;

    public NotificationController(NotificationRepository notificationRepository,
                                  @Autowired(required = false) PasswordResetService passwordResetService) {
        this.notificationRepository = notificationRepository;
        this.passwordResetService   = passwordResetService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationRepository.findAllByOrderByDateCreationDesc());
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications() {
        return ResponseEntity.ok(notificationRepository.findByLueFalseOrderByDateCreationDesc());
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        long count = notificationRepository.countByLueFalse();
        Map<String, Object> resp = new HashMap<>();
        resp.put("count", count);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id).map(notif -> {
            notif.setLue(true);
            notificationRepository.save(notif);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("id", id);
            return ResponseEntity.ok(resp);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        List<Notification> unread = notificationRepository.findByLueFalseOrderByDateCreationDesc();
        for (Notification n : unread) {
            n.setLue(true);
        }
        notificationRepository.saveAll(unread);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("markedCount", unread.size());
        return ResponseEntity.ok(resp);
    }

    /**
     * Approuve la réinitialisation de mot de passe directement depuis une notification :
     * POST /api/notifications/{id}/approve ou /api/admin/notifications/{id}/approve
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveNotification(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        if (passwordResetService == null) {
            return ResponseEntity.status(500).body(Map.of("error", "Service de réinitialisation indisponible"));
        }
        String customMdp = body != null ? body.getOrDefault("nouveauMdp", body.get("password")) : null;
        String commentaire = body != null ? body.get("commentaire") : null;
        Map<String, Object> result = passwordResetService.approveResetByNotificationId(id, customMdp, commentaire);
        return ResponseEntity.ok(result);
    }
}
