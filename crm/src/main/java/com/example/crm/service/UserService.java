package com.example.crm.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.crm.dto.UserCreateRequest;
import com.example.crm.entity.Role;
import com.example.crm.entity.User;
import com.example.crm.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // CREATE
    public User meCreerUtilisateur(UserCreateRequest dto) {
        if (dto.getLogin() == null || dto.getLogin().trim().isEmpty()) {
            throw new IllegalArgumentException("Le login est obligatoire.");
        }
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("L'e-mail est obligatoire.");
        }
        if (dto.getMdp() == null || dto.getMdp().trim().isEmpty()) {
            throw new IllegalArgumentException("Le mot de passe est obligatoire.");
        }

        if (userRepository.existsByLogin(dto.getLogin().trim())) {
            throw new IllegalArgumentException("Le login est déjà utilisé : " + dto.getLogin());
        }
        if (userRepository.existsByEmail(dto.getEmail().trim())) {
            throw new IllegalArgumentException("L'e-mail est déjà utilisé : " + dto.getEmail());
        }

        User user = new User();
        user.setLogin(dto.getLogin().trim());
        user.setEmail(dto.getEmail().trim());
        user.setMdp(passwordEncoder.encode(dto.getMdp().trim()));
        user.setNomComplet(dto.getNomComplet() != null ? dto.getNomComplet().trim() : null);

        // Assignation du rôle (ADMIN, MANAGER, CLIENT, USER)
        if (dto.getRole() != null && !dto.getRole().trim().isEmpty()) {
            try {
                user.setRole(Role.valueOf(dto.getRole().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Rôle invalide : " + dto.getRole() + ". Valeurs possibles: ADMIN, MANAGER, CLIENT, USER.");
            }
        } else {
            user.setRole(Role.CLIENT);
        }

        // Statut (ACTIF / INACTIF)
        if (dto.getStatut() != null && !dto.getStatut().trim().isEmpty()) {
            user.setStatut(dto.getStatut().trim().toUpperCase());
        } else {
            user.setStatut("ACTIF");
        }

        user.setTelephone(dto.getTelephone() != null ? dto.getTelephone().trim() : null);
        user.setDateConnexion(LocalDateTime.now());

        return userRepository.save(user);
    }

    // READ ALL
    public List<User> meObtenirTousLesUtilisateurs() {
        return userRepository.findAll();
    }

    // READ BY ID
    public User meObtenirParId(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec l'ID : " + id));
    }

    // UPDATE
    public User meMettreAJourUtilisateur(Long id, UserCreateRequest dto) {
        User user = meObtenirParId(id);

        if (dto.getLogin() != null && !dto.getLogin().trim().isEmpty()) {
            String newLogin = dto.getLogin().trim();
            userRepository.findByLogin(newLogin).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new IllegalArgumentException("Ce login est déjà utilisé par un autre utilisateur.");
                }
            });
            user.setLogin(newLogin);
        }

        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            String newEmail = dto.getEmail().trim();
            userRepository.findByEmail(newEmail).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new IllegalArgumentException("Cet e-mail est déjà utilisé par un autre utilisateur.");
                }
            });
            user.setEmail(newEmail);
        }

        if (dto.getNomComplet() != null) {
            user.setNomComplet(dto.getNomComplet().trim());
        }

        if (dto.getTelephone() != null) {
            user.setTelephone(dto.getTelephone().trim());
        }

        if (dto.getRole() != null && !dto.getRole().trim().isEmpty()) {
            try {
                user.setRole(Role.valueOf(dto.getRole().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Rôle invalide : " + dto.getRole() + ". Valeurs possibles: ADMIN, MANAGER, CLIENT, USER.");
            }
        }

        if (dto.getStatut() != null && !dto.getStatut().trim().isEmpty()) {
            user.setStatut(dto.getStatut().trim().toUpperCase());
        }

        if (dto.getMdp() != null && !dto.getMdp().trim().isEmpty()) {
            user.setMdp(passwordEncoder.encode(dto.getMdp().trim()));
        }

        return userRepository.save(user);
    }

    // DELETE
    public void meSupprimerUtilisateur(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("Utilisateur introuvable avec l'ID : " + id);
        }
        userRepository.deleteById(id);
    }
}