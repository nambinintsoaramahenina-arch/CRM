package com.example.crm.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class LoginRequest {

    @JsonAlias({"login", "username", "email", "identifiant"})
    private String identifiant; 

    @JsonAlias({"password", "pwd", "mdp"})
    private String mdp;            

    public LoginRequest() {}

    public LoginRequest(String identifiant, String mdp) {
        this.identifiant = identifiant;
        this.mdp = mdp;
    }

    public String getIdentifiant() { 
        return identifiant != null ? identifiant.trim() : null; 
    }
    public void setIdentifiant(String identifiant) { 
        this.identifiant = identifiant; 
    }

    public String getMdp() { 
        return mdp != null ? mdp.trim() : null; 
    }
    public void setMdp(String mdp) { 
        this.mdp = mdp; 
    }
}