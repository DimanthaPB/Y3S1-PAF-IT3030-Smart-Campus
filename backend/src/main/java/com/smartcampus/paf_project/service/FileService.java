package com.smartcampus.paf_project.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;

@Service
public class FileService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    /*public String saveFile(MultipartFile file) throws IOException {

        String fileName = file.getOriginalFilename();

        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String filePath = uploadDir + File.separator + fileName;

        file.transferTo(new File(filePath));

        return filePath;
    }*/

    public String saveFile(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename() == null ? "upload-image" : file.getOriginalFilename();
        String safeFileName = Paths.get(originalName).getFileName().toString();
        if (safeFileName.isBlank()) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String storedFileName = System.currentTimeMillis() + "_" + safeFileName;

        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String filePath = dir.getAbsolutePath() + File.separator + storedFileName;

        file.transferTo(new File(filePath));

        return "uploads/" + storedFileName;
    }

    public void deleteFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }

        File file = new File(relativePath);
        if (!file.isAbsolute()) {
            file = new File(uploadDir, relativePath.replace("uploads/", ""));
        }

        if (file.exists() && !file.delete()) {
            System.err.println("Failed to delete file: " + file.getAbsolutePath());
        }
    }
    
    
}
