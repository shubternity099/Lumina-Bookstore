package com.bookstore.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.bookstore.model.Book;

public class BookDAO {
    private String jdbcURL = "jdbc:mysql://localhost:3306/bookstore";
    private String jdbcUsername = "root";
    private String jdbcPassword = "password";

    protected Connection getConnection() {
        Connection connection = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            connection = DriverManager.getConnection(jdbcURL, jdbcUsername, jdbcPassword);
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
        return connection;
    }

    public void insertBook(Book book) throws SQLException {
        String sql = "INSERT INTO books (title, author, price, description, image_url) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, book.getTitle());
            stmt.setString(2, book.getAuthor());
            stmt.setDouble(3, book.getPrice());
            stmt.setString(4, book.getDescription());
            stmt.setString(5, book.getImageUrl());
            stmt.executeUpdate();
        }
    }

    public List<Book> selectAllBooks() {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT * FROM books";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                int id = rs.getInt("id");
                String title = rs.getString("title");
                String author = rs.getString("author");
                double price = rs.getDouble("price");
                String description = rs.getString("description");
                String imageUrl = rs.getString("image_url");
                books.add(new Book(id, title, author, price, description, imageUrl));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return books;
    }
    
    // Update and Delete methods would follow similar patterns...
}
