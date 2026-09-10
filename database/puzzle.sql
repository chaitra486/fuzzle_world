CREATE DATABASE puzzle_world;

USE puzzle_world;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    srn VARCHAR(50) NOT NULL,
    score INT NOT NULL DEFAULT 0,
    attended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);