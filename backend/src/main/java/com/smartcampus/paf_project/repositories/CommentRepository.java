package com.smartcampus.paf_project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartcampus.paf_project.models.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}
