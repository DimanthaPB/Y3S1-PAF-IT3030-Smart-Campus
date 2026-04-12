package com.smartcampus.paf_project.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

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

    String fileName = file.getOriginalFilename();

    File dir = new File(uploadDir);
    if (!dir.exists()) {
        dir.mkdirs();
    }

    String filePath = dir.getAbsolutePath() + File.separator + fileName;

    System.out.println("Saving file to: " + filePath);

    file.transferTo(new File(filePath));

    return filePath;
}

    
}
