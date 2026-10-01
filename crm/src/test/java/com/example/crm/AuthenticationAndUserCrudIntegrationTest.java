package com.example.crm;

import com.example.crm.dto.LoginRequest;
import com.example.crm.dto.UserCreateRequest;
import com.example.crm.entity.User;
import com.example.crm.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthenticationAndUserCrudIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        // Nettoyer les utilisateurs de test éventuels
        userRepository.findByLogin("manager_test").ifPresent(userRepository::delete);
        userRepository.findByLogin("client_test").ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("1. Connexion Admin réussie avec POST /api/auth/login")
    void testAdminLoginSuccess() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin", "admin123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.nomComplet").value("Super Admin"))
                .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        JsonNode root = objectMapper.readTree(responseJson);
        assertThat(root.get("token").asText()).isNotBlank();
    }

    @Test
    @DisplayName("2. Échec de connexion avec mot de passe incorrect")
    void testLoginWithInvalidPassword() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin", "mauvaismdp");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists())
                .andExpect(jsonPath("$.message").value("Identifiant ou mot de passe incorrect."));
    }

    @Test
    @DisplayName("3. Cycle complet : Création Manager & Client, List, RBAC, Update, Delete")
    void testFullUserCrudAndRbacCycle() throws Exception {
        // A. Connexion Admin pour obtenir le token
        LoginRequest adminLogin = new LoginRequest("admin", "admin123");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String adminToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();

        // B. Admin crée un Manager
        UserCreateRequest managerRequest = new UserCreateRequest(
                "manager_test",
                "manager_test@example.com",
                "manager123",
                "Test Manager",
                "MANAGER",
                "0341111111"
        );

        MvcResult managerCreateResult = mockMvc.perform(post("/api/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(managerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.login").value("manager_test"))
                .andExpect(jsonPath("$.role").value("MANAGER"))
                .andExpect(jsonPath("$.statut").value("ACTIF"))
                .andExpect(jsonPath("$.mdp").doesNotExist()) // Le mot de passe ne doit PAS fuiter
                .andReturn();

        Long managerId = objectMapper.readTree(managerCreateResult.getResponse().getContentAsString()).get("id").asLong();

        // C. Admin crée un Client
        UserCreateRequest clientRequest = new UserCreateRequest(
                "client_test",
                "client_test@example.com",
                "client123",
                "Test Client",
                "CLIENT",
                "0342222222"
        );

        MvcResult clientCreateResult = mockMvc.perform(post("/api/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(clientRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.login").value("client_test"))
                .andExpect(jsonPath("$.role").value("CLIENT"))
                .andReturn();

        Long clientId = objectMapper.readTree(clientCreateResult.getResponse().getContentAsString()).get("id").asLong();

        // D. Admin liste tous les utilisateurs
        mockMvc.perform(get("/api/users")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.login == 'manager_test')]").exists())
                .andExpect(jsonPath("$[?(@.login == 'client_test')]").exists())
                .andExpect(jsonPath("$[0].mdp").doesNotExist()); // Pas de mot de passe dans la liste

        // E. Connexion du Manager créé avec ses propres identifiants
        LoginRequest managerLogin = new LoginRequest("manager_test", "manager123");
        MvcResult managerLoginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(managerLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("MANAGER"))
                .andReturn();

        String managerToken = objectMapper.readTree(managerLoginResult.getResponse().getContentAsString()).get("token").asText();

        // F. RBAC : Le Manager tente d'accéder à l'API /api/users réservée à l'ADMIN -> 403 FORBIDDEN
        mockMvc.perform(get("/api/users")
                .header("Authorization", "Bearer " + managerToken))
                .andExpect(status().isForbidden());

        // G. Un utilisateur sans token tente d'accéder à /api/users -> 401 UNAUTHORIZED
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());

        // H. Admin met à jour le Manager (téléphone et nom complet)
        UserCreateRequest updateRequest = new UserCreateRequest(
                "manager_test",
                "manager_updated@example.com",
                null,
                "Manager Updated Name",
                "MANAGER",
                "0349999999"
        );

        mockMvc.perform(put("/api/users/" + managerId)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nomComplet").value("Manager Updated Name"))
                .andExpect(jsonPath("$.email").value("manager_updated@example.com"))
                .andExpect(jsonPath("$.telephone").value("0349999999"));

        // I. Admin supprime les utilisateurs créés pour le test
        mockMvc.perform(delete("/api/users/" + managerId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/users/" + clientId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        // Vérification en base
        assertThat(userRepository.findById(managerId)).isEmpty();
        assertThat(userRepository.findById(clientId)).isEmpty();
    }
}
