package com.dani7759.book.exception;

public class OperationNotPermittedException extends RuntimeException {

    public OperationNotPermittedException(String msg) {
        super(msg);
    }
}
