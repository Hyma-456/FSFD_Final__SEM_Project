package com.researchcollab.controller;

import com.researchcollab.model.Milestone;
import com.researchcollab.repository.MilestoneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/milestones")
public class MilestoneController {

    private final MilestoneRepository milestoneRepository;

    public MilestoneController(MilestoneRepository milestoneRepository) {
        this.milestoneRepository = milestoneRepository;
    }

    @GetMapping
    public List<Milestone> getAllMilestones() {
        return milestoneRepository.findAll();
    }

    @GetMapping("/project/{projectId}")
    public List<Milestone> getMilestonesByProject(@PathVariable Long projectId) {
        return milestoneRepository.findByProjectId(projectId);
    }

    @PostMapping
    public Milestone createMilestone(@RequestBody Milestone milestone) {
        return milestoneRepository.save(milestone);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Milestone> updateMilestone(@PathVariable Long id, @RequestBody Milestone details) {
        return milestoneRepository.findById(id).map(milestone -> {
            if (details.getName() != null) milestone.setName(details.getName());
            if (details.getDone() != null) milestone.setDone(details.getDone());
            return ResponseEntity.ok(milestoneRepository.save(milestone));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMilestone(@PathVariable Long id) {
        if (milestoneRepository.existsById(id)) {
            milestoneRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
