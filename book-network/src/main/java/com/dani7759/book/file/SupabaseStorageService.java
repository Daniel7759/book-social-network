package com.dani7759.book.file;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;

@Service
@Slf4j
@RequiredArgsConstructor
public class SupabaseStorageService {

    private final WebClient.Builder webClientBuilder;

    public String uploadFile(MultipartFile file) throws IOException {
        String bucket = "book-cover";
        String filename = file.getOriginalFilename();
        String supabaseUrl = "https://lqamfnkcnbqkbqldnyly.supabase.co/storage/v1/object/";
        String fullstorageUrl = supabaseUrl + bucket + "/" + filename;

        WebClient client = webClientBuilder.build();
        SupabaseUploadResponse response = client.post()
                .uri(fullstorageUrl)
                .header("apiKey", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxYW1mbmtjbmJxa2JxbGRueWx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTUyMzQ2MiwiZXhwIjoyMDYxMDk5NDYyfQ.V9xgjlTZ_5TT5O10ghjWV2R_61DmZG4Krh_dtGNHwOg")
                .header("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxYW1mbmtjbmJxa2JxbGRueWx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTUyMzQ2MiwiZXhwIjoyMDYxMDk5NDYyfQ.V9xgjlTZ_5TT5O10ghjWV2R_61DmZG4Krh_dtGNHwOg")
                .header("Content-Type", file.getContentType())
                .bodyValue(file.getBytes())
                .retrieve()
                .bodyToMono(SupabaseUploadResponse.class)
                .block();

        if (response != null && response.getKey() != null && !response.getKey().isBlank()) {
            String publicUrl = supabaseUrl + "public/" + response.getKey();
            log.info("Public URL: {}", publicUrl);
            return publicUrl;
        } else {
            log.error("Failed to upload file to Supabase");
            return null;
        }

    }
}
