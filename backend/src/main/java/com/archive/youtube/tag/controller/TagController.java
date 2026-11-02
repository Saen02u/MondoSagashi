package com.archive.youtube.tag.controller;

import com.archive.youtube.tag.dto.TagResponse;
import com.archive.youtube.tag.repository.TagRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 태그 목록 조회를 위한 REST 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/tags")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TagController {

    private final TagRepository tagRepository;

    public TagController(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @GetMapping
    public ResponseEntity<List<TagResponse>> getTags() {
        List<TagResponse> tags = tagRepository.findAll().stream()
            .map(TagResponse::from)
            .toList();
        return ResponseEntity.ok(tags);
    }
}
