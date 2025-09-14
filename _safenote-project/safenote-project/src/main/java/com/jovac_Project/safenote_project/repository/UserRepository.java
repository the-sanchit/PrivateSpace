package com.jovac_Project.safenote_project.repository;


// import com.jovac_Project.safenote_project.entity.Note;
import com.jovac_Project.safenote_project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

// import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}


