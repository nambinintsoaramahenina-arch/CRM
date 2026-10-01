package com.example.crm.config;

import com.example.crm.entity.Role;
import com.example.crm.entity.User;
import com.example.crm.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DbTestRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DbTestRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        initOrUpdateUser("admin", "admin@test.com", "admin123", Role.ADMIN, "Super Admin", "0340000000");
        initOrUpdateUser("manager", "manager@crm.com", "manager123", Role.MANAGER, "Manager Principal", "0341112233");
        initOrUpdateUser("manager1", "manager1@crm.com", "manager123", Role.MANAGER, "Jean Manager", "0341234567");
        initOrUpdateUser("client", "client@crm.com", "client123", Role.CLIENT, "Client Partenaire", "0345556677");
        initOrUpdateUser("client1", "client1@crm.com", "client123", Role.CLIENT, "Alice Client", "0349876543");
    }

    private void initOrUpdateUser(String login, String email, String rawPassword, Role role, String nomComplet, String tel) {
        userRepository.findByLogin(login).ifPresentOrElse(
            user -> {
                user.setMdp(passwordEncoder.encode(rawPassword));
                user.setStatut("ACTIF");
                user.setRole(role);
                if (user.getEmail() == null || user.getEmail().isEmpty()) {
                    user.setEmail(email);
                }
                userRepository.save(user);
                System.out.println(">>> SUCCÈS : Utilisateur '" + login + "' synchronisé (" + role + ", ACTIF).");
            },
            () -> {
                User user = new User();
                user.setNomComplet(nomComplet);
                user.setEmail(email);
                user.setTelephone(tel);
                user.setLogin(login);
                user.setMdp(passwordEncoder.encode(rawPassword));
                user.setRole(role);
                user.setStatut("ACTIF");
                userRepository.save(user);
                System.out.println(">>> SUCCÈS : Nouvel utilisateur '" + login + "' créé (" + role + ", mot de passe: " + rawPassword + ").");
            }
        );
    }
}