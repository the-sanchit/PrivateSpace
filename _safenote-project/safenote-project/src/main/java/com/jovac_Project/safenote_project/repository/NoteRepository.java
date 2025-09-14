package com.jovac_Project.safenote_project.repository;

import com.jovac_Project.safenote_project.entity.Note;
import com.jovac_Project.safenote_project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
        List<Note> findByUser(User user);
}
