package com.dani7759.book.book;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookResponse {

    private Integer id;
    private String title;
    private String authorName;
    private String isbn;
    private String synopsis;
    private String owner;
    private byte[] cover;
    private double rate;
    private boolean archived;
    private boolean shareable;
}
