package com.jovac_Project.safenote_project.controller;

import com.jovac_Project.safenote_project.entity.Note;
import com.jovac_Project.safenote_project.entity.User;
import com.jovac_Project.safenote_project.repository.NoteRepository;
import com.jovac_Project.safenote_project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notes")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Note> getNotes(Authentication authentication) {
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return noteRepository.findByUser(currentUser);
    }

    @PostMapping
    public Note createNote(@RequestBody Note note, Authentication authentication) {
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        note.setUser(currentUser);
        return noteRepository.save(note);
    }

    // ✅ New DELETE endpoint
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id, Authentication authentication) {
        try {
            // Get current user
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Find the note
            Note note = noteRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Note not found"));
            
            // Check if note belongs to current user
            if (!note.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can only delete your own notes"));
            }
            
            // Delete the note
            noteRepository.delete(note);
            
            return ResponseEntity.ok(Map.of("message", "Note deleted successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to delete note: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateNote(@PathVariable Long id,
                                        @RequestBody Map<String, String> body,
                                        Authentication authentication) {
        try {
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Note note = noteRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Note not found"));
            if (!note.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can only edit your own notes"));
            }
            String newContent = body.get("content");
            if (newContent == null || newContent.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Content cannot be empty"));
            }
            note.setContent(newContent.trim());
            return ResponseEntity.ok(noteRepository.save(note));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to update note: " + e.getMessage()));
        }
    }
}
