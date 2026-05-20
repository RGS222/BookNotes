-- SETUP --
CREATE DATABASE booknotes;
-- manually select booknotes database, then use Query Tool
-- for the below scripts

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(40) NOT NULL UNIQUE,
    password VARCHAR(40) NOT NULL
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    userId INT REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    author VARCHAR(100),
    notes TEXT,
    rating INT,
    lastUpdateDate DATE
);

-- GET user password --
CREATE OR REPLACE PROCEDURE getUserPassword(
    name VARCHAR,
    INOUT pass VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
	IF name IS NULL THEN
        RAISE EXCEPTION 'Parameter name cannot be NULL';
    END IF;
	
    SELECT password 
    INTO pass
    FROM users 
    WHERE username = name;
END;
$$;

-- GET user ID and password--
CREATE OR REPLACE PROCEDURE getUserIdPassword(
    _name VARCHAR,
    INOUT _id INT DEFAULT NULL,
    INOUT _password VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
	IF _name IS NULL THEN
        RAISE EXCEPTION 'Parameter name cannot be NULL';
    END IF;
	
    SELECT id, password 
    INTO _id, _password
    FROM users 
    WHERE username = _name;
END;
$$;

-- GET review owner --
CREATE OR REPLACE PROCEDURE getReviewOwner(
    _reviewId INT,
    INOUT _username INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
	IF _reviewId IS NULL THEN
        RAISE EXCEPTION 'Parameter _reviewId cannot be NULL';
    END IF;
	
    SELECT u.username 
    INTO _username
    FROM reviews r 
    INNER JOIN users u ON u.id = r.userId
    WHERE r.reviewId = _reviewId;
END;
$$;

-- GET user reviews --
CREATE OR REPLACE FUNCTION getUserReviews(
    name VARCHAR --if null return all reviews
) 
RETURNS SETOF reviews
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.* FROM reviews r 
    INNER JOIN users u ON u.id = r.userId
    WHERE name IS NULL OR u.username = name;
END;
$$;

-- ADD user --
CREATE OR REPLACE PROCEDURE addUser(
    name VARCHAR,
    pass VARCHAR,
    INOUT returnId INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
	IF name IS NULL OR pass IS NULL THEN
        RAISE EXCEPTION 'Both parameter name and pass cannot be NULL';
    END IF;
	
    INSERT INTO users (username, password)
    VALUES (name, pass)
    RETURNING id into returnId;
END;
$$;

-- UPDATE user password --
CREATE OR REPLACE PROCEDURE updateUser(
    name VARCHAR,
    newPassword VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
	IF name IS NULL OR newPassword IS NULL THEN
        RAISE EXCEPTION 'Both parameter name and newPassword cannot be NULL';
    END IF;
    
    UPDATE users SET password = newPassword WHERE username = name;
END;
$$;

-- DELETE user password --
CREATE OR REPLACE PROCEDURE deleteUser(
    name VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
	IF name IS NULL THEN
        RAISE EXCEPTION 'Parameter name cannot be NULL';
    END IF;
    
    DELETE FROM users WHERE username = name;
END;
$$;

-- ADD user review
CREATE OR REPLACE PROCEDURE addReview(
    userId INT,
    title VARCHAR,
    author VARCHAR,
    notes TEXT,
    rating INT,
    lastUpdateDate DATE,
    INOUT returnId INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
	IF userId IS NULL OR title IS NULL THEN
        RAISE EXCEPTION 'Both parameter userId and title cannot be NULL';
    END IF;
    
    INSERT INTO reviews (userId, title, author, notes, rating, lastUpdateDate)
    VALUES (userId, title, author, notes, rating, lastUpdateDate)
    RETURNING id into returnId;
END;
$$;

-- UPDATE user review
CREATE OR REPLACE PROCEDURE updateReview(
    _reviewId INT,
    _notes TEXT,
    _rating INT,
    _lastUpdateDate DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
	IF _reviewId IS NULL THEN
        RAISE EXCEPTION 'Parameter _reviewId cannot be NULL';
    END IF;
    
    UPDATE reviews SET notes = _notes, rating = _rating, lastUpdateDate = _lastUpdateDate
    WHERE id = _reviewId;
END;
$$;

-- DELETE user review
CREATE OR REPLACE PROCEDURE deleteReview(
    reviewId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
	IF reviewId IS NULL THEN
        RAISE EXCEPTION 'Parameter reviewId cannot be NULL';
    END IF;
  
    DELETE FROM reviews where id = reviewId;
END;
$$;
