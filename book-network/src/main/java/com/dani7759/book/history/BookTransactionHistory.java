package com.dani7759.book.history;

import com.dani7759.book.book.Book;
import com.dani7759.book.common.BaseEntity;
import com.dani7759.book.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class BookTransactionHistory extends BaseEntity {

    //user relationships
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    //book relationships
    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    private boolean returned;
    private boolean returnApproved;
}
