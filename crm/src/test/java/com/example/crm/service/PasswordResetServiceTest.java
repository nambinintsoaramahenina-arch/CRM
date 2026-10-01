package com.example.crm.service;

import com.example.crm.dto.ForgotPasswordRequest;
import com.example.crm.dto.ResetPasswordRequest;
import com.example.crm.entity.Role;
import com.example.crm.entity.User;
import com.example.crm.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Proxy;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PasswordResetServiceTest {

    private final Map<String, User> emailDb = new HashMap<>();
    private final Map<String, User> tokenDb = new HashMap<>();
    private User savedUser;

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private PasswordResetService passwordResetService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        emailDb.clear();
        tokenDb.clear();
        savedUser = null;

        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setLogin("john_doe");
        sampleUser.setEmail("john@crm.com");
        sampleUser.setMdp("encodedOldPassword");
        sampleUser.setRole(Role.CLIENT);
        sampleUser.setStatut("ACTIF");

        // Dynamic proxy for UserRepository without requiring Mockito ByteBuddy agent (Java 21 compliant)
        userRepository = (UserRepository) Proxy.newProxyInstance(
                UserRepository.class.getClassLoader(),
                new Class<?>[]{UserRepository.class},
                (proxy, method, args) -> {
                    String methodName = method.getName();
                    if ("findByEmail".equals(methodName)) {
                        String email = (String) args[0];
                        return Optional.ofNullable(emailDb.get(email));
                    }
                    if ("findByResetToken".equals(methodName)) {
                        String token = (String) args[0];
                        return Optional.ofNullable(tokenDb.get(token));
                    }
                    if ("save".equals(methodName)) {
                        User user = (User) args[0];
                        savedUser = user;
                        if (user.getEmail() != null) {
                            emailDb.put(user.getEmail(), user);
                        }
                        if (user.getResetToken() != null) {
                            tokenDb.put(user.getResetToken(), user);
                        }
                        return user;
                    }
                    return null;
                }
        );

        passwordEncoder = new PasswordEncoder() {
            @Override
            public String encode(CharSequence rawPassword) {
                return "ENCODED_" + rawPassword;
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                return ("ENCODED_" + rawPassword).equals(encodedPassword);
            }
        };

        passwordResetService = new PasswordResetService(userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("processForgotPassword génère un token et une date d'expiration")
    void testProcessForgotPassword_Success() {
        emailDb.put("john@crm.com", sampleUser);

        ForgotPasswordRequest request = new ForgotPasswordRequest("john@crm.com");
        Map<String, Object> result = passwordResetService.processForgotPassword(request);

        assertThat(result).isNotNull();
        assertThat(result.get("status")).isEqualTo(200);
        assertThat(result.get("resetToken")).isNotNull();
        assertThat(result.get("expiresAt")).isNotNull();

        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getResetToken()).isEqualTo(result.get("resetToken"));
        assertThat(savedUser.getResetTokenExpiry()).isAfter(LocalDateTime.now());
    }

    @Test
    @DisplayName("processForgotPassword lève une exception si l'e-mail est inconnu")
    void testProcessForgotPassword_UserNotFound() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("unknown@crm.com");

        assertThatThrownBy(() -> passwordResetService.processForgotPassword(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Aucun compte n'est associé à cette adresse e-mail");
    }

    @Test
    @DisplayName("processResetPassword met à jour le mot de passe et invalide le token")
    void testProcessResetPassword_Success() {
        String token = "valid-token-12345";
        sampleUser.setResetToken(token);
        sampleUser.setResetTokenExpiry(LocalDateTime.now().plusMinutes(20));
        tokenDb.put(token, sampleUser);

        ResetPasswordRequest request = new ResetPasswordRequest(token, "newSecretPassword123");
        Map<String, Object> result = passwordResetService.processResetPassword(request);

        assertThat(result.get("status")).isEqualTo(200);
        assertThat(result.get("message")).toString().contains("succès");

        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getMdp()).isEqualTo("ENCODED_newSecretPassword123");
        assertThat(savedUser.getResetToken()).isNull();
        assertThat(savedUser.getResetTokenExpiry()).isNull();
    }

    @Test
    @DisplayName("processResetPassword échoue si le token est expiré")
    void testProcessResetPassword_ExpiredToken() {
        String token = "expired-token";
        sampleUser.setResetToken(token);
        sampleUser.setResetTokenExpiry(LocalDateTime.now().minusMinutes(10));
        tokenDb.put(token, sampleUser);

        ResetPasswordRequest request = new ResetPasswordRequest(token, "newSecretPassword123");

        assertThatThrownBy(() -> passwordResetService.processResetPassword(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("a expiré");
    }

    @Test
    @DisplayName("processResetPassword échoue si le mot de passe est trop court")
    void testProcessResetPassword_ShortPassword() {
        ResetPasswordRequest request = new ResetPasswordRequest("any-token", "123");

        assertThatThrownBy(() -> passwordResetService.processResetPassword(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("au moins 6 caractères");
    }
}
