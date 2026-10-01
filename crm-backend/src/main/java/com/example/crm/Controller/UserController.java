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

@RestController
@RequestMapping({"/api/users", "/api/admin/users"})
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:3000") 
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    // Le reste de tes méthodes reste inchangé...

    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody UserCreateRequest request) {
        User createdUser = userService.meCreerUtilisateur(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.meObtenirParId(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserCreateRequest request) {
        User updatedUser = userService.meMettreAJourUtilisateur(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.meSupprimerUtilisateur(id);
        return ResponseEntity.noContent().build();
    }
}