package com.example.crm.Controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/view") // URL modifiée pour éviter le conflit d'ambiguïté sur "/"
    public String dashboard(Authentication authentication, Model model) {
        return "dashboard";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }
}