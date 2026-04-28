package com.researchcollab.controller;

import com.researchcollab.model.ProjectMember;
import com.researchcollab.repository.ProjectMemberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project_members")
public class ProjectMemberController {

    private final ProjectMemberRepository projectMemberRepository;

    public ProjectMemberController(ProjectMemberRepository projectMemberRepository) {
        this.projectMemberRepository = projectMemberRepository;
    }

    @GetMapping
    public List<ProjectMember> getAllProjectMembers() {
        return projectMemberRepository.findAll();
    }

    @PostMapping
    public ProjectMember createProjectMember(@RequestBody ProjectMember projectMember) {
        return projectMemberRepository.save(projectMember);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProjectMember(@PathVariable Long id) {
        if (projectMemberRepository.existsById(id)) {
            projectMemberRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
