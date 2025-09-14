package com.jovac_Project.safenote_project.config;

import com.jovac_Project.safenote_project.entity.User;
import com.jovac_Project.safenote_project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if users already exist to prevent duplicates
        if (userRepository.findByUsername("testuser").isEmpty()) {
            User user1 = new User();
            user1.setUsername("testuser");
            user1.setPassword(passwordEncoder.encode("password123"));
            userRepository.save(user1);
            System.out.println("Test user created: testuser/password123");
        }

        if (userRepository.findByUsername("demo").isEmpty()) {  // ✅ Added .isEmpty()
            User user2 = new User();
            user2.setUsername("demo");
            user2.setPassword(passwordEncoder.encode("demo123"));
            userRepository.save(user2);
            System.out.println("Demo user created: demo/demo123");
        }
    }
}
