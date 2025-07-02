package com.dani7759.book.file;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class SupabaseUploadResponse {

    @JsonProperty("Key")
    private String key;

    @JsonProperty("Id")
    private String id;
}
