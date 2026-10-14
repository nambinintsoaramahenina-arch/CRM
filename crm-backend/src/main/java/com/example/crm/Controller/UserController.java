package com.example.crm.Controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*; // Contient déjà @CrossOrigin si tu l'importes

import com.example.crm.dto.UserCreateRequest;
import com.example.crm.entity.Role;
import com.example.crm.entity.User;
import com.example.crm.repository.UserRepository;
import com.example.crm.service.UserService;

import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/users", "/api/admin/users"})
@CrossOrigin(origins = "http://localhost:3000") 
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final com.example.crm.service.PasswordRequestAdminService passwordRequestAdminService;

    public UserController(UserService userService,
                          UserRepository userRepository,
                          com.example.crm.service.PasswordRequestAdminService passwordRequestAdminService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordRequestAdminService = passwordRequestAdminService;
    }

    // Le reste de tes méthodes reste inchangé...

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(@Valid @RequestBody UserCreateRequest request) {
        User createdUser = userService.meCreerUtilisateur(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        // Conversion sécurisée du String role en Enum Role si présent
        Role roleEnum = null;
        if (role != null && !role.trim().isEmpty()) {
            try {
                roleEnum = Role.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Rôle invalide fourni dans la requête
                return ResponseEntity.badRequest().body(null);
            }
        }

        Sort sort = direction.equalsIgnoreCase("desc") ? 
                    Sort.by(sortBy).descending() : 
                    Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);

        // Appel avec l'enum converti
        Page<User> users = userRepository.rechercherEtFiltrer(keyword, roleEnum, statut, pageable);
        
        return ResponseEntity.ok(users);
    }

    /**
     * GET /api/users/all — Liste complète (non paginée) des utilisateurs.
     * Retourne uniquement id, nomComplet, login et role pour alimenter
     * les sélecteurs du formulaire de tâches côté frontend.
     * Accessible à tout utilisateur authentifié.
     */
    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getAllUsersForSelect() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "nomComplet", u.getNomComplet() != null ? u.getNomComplet() : u.getLogin(),
                        "login", u.getLogin() != null ? u.getLogin() : "",
                        "role", u.getRole() != null ? u.getRole().name() : "USER"
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.meObtenirParId(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserCreateRequest request) {
        User updatedUser = userService.meMettreAJourUtilisateur(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.meSupprimerUtilisateur(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Étape 3 — Réinitialise le mot de passe d'un utilisateur par son ID (admin sécurisé).
     * POST /api/admin/users/{id}/reset-password
     * POST /api/users/{id}/reset-password
     *
     * Permet à l'admin soit de saisir un nouveau mot de passe, soit de laisser le système en générer un,
     * le hache avec BCrypt, met à jour l'utilisateur et lui envoie un email avec le mot de passe temporaire.
     */
    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> resetPassword(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String commentaire = (body != null) ? body.get("commentaire") : null;
        String nouveauMdp = null;
        if (body != null) {
            nouveauMdp = body.getOrDefault("nouveauMdp", body.get("password"));
        }
        java.util.Map<String, Object> result = passwordRequestAdminService.reinitialiserMotDePasseParUserId(id, nouveauMdp, commentaire);
        return ResponseEntity.ok(result);
    }
}