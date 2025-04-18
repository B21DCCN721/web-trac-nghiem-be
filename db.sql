DROP DATABASE quiz_app;
CREATE DATABASE quiz_app;
USE quiz_app;

-- Bảng quản trị viên
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng người dùng (người làm bài thi)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    class VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng bài kiểm tra (do admin quản lý)
CREATE TABLE tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author VARCHAR(255) NOT NULL,
    quantity int NOT NULL,
    attempts INT DEFAULT 0,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE CASCADE
);

-- Bảng câu hỏi
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    question_text TEXT NOT NULL,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- Bảng đáp án
CREATE TABLE answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Bảng lịch sử làm bài
CREATE TABLE test_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_id INT NOT NULL,
    score FLOAT DEFAULT 0,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- Bảng lưu câu trả lời của người dùng
CREATE TABLE user_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    history_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_id INT NOT NULL,
    FOREIGN KEY (history_id) REFERENCES test_history(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE
);
ALTER TABLE users
ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';
ALTER TABLE admins
ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'admin';
use quiz_app;
INSERT INTO tests (title, description, created_by, author, quantity) VALUES
('Bài kiểm tra Toán', 'Bài kiểm tra kiến thức Toán cơ bản.', 1, 'B21DCCN721', 2),
('Bài kiểm tra Lịch sử', 'Bài kiểm tra kiến thức lịch sử thế giới.', 1, 'B21DCCN721', 2);
INSERT INTO questions (test_id, question_text) VALUES
(1, '5 + 3 = ?'),
(1, '10 - 6 = ?'),
(2, 'Ai là người phát hiện ra châu Mỹ?'),
(2, 'Năm nào diễn ra Cách mạng tháng 10 Nga?');
INSERT INTO answers (question_id, answer_text, is_correct) VALUES
-- Câu hỏi 1
(1, '6', 0),
(1, '7', 0),
(1, '8', 1),
(1, '9', 0),

-- Câu hỏi 2
(2, '2', 0),
(2, '4', 1),
(2, '6', 0),
(2, '8', 0),

-- Câu hỏi 3
(3, 'Napoleon', 0),
(3, 'Columbus', 1),
(3, 'Washington', 0),
(3, 'Genghis Khan', 0),

-- Câu hỏi 4
(4, '1914', 0),
(4, '1917', 1),
(4, '1923', 0),
(4, '1930', 0);
-- INSERT INTO test_history (user_id, test_id, score) VALUES
-- (1, 1, 100),
-- (2, 2, 50);
-- INSERT INTO user_answers (history_id, question_id, answer_id) VALUES
-- (1, 1, 3),  -- User 1 chọn đáp án đúng (8) cho câu hỏi 1
-- (1, 2, 6),  -- User 1 chọn đáp án đúng (4) cho câu hỏi 2
-- (2, 3, 3),  -- User 2 chọn đáp án đúng (Columbus) cho câu hỏi 3
-- (2, 4, 7);  -- User 2 chọn đáp án sai (1914) cho câu hỏi 4
