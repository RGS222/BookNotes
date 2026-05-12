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
    OUT pass VARCHAR
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

-- GET user reviews --
CREATE OR REPLACE FUNCTION getUserReviews(
    name VARCHAR --if null return all reviews
) 
RETURNS SETOF reviews
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT r.* FROM reviews r 
    INNER JOIN users u ON u.id = r.userId
    WHERE user IS NULL OR u.username = name;
END;
$$;

-- ADD user --
CREATE OR REPLACE PROCEDURE addUser(
    name VARCHAR,
    pass VARCHAR,
    OUT id INT
)
LANGUAGE plpgsql
AS $$
BEGIN
	IF name IS NULL OR pass IS NULL THEN
        RAISE EXCEPTION 'Both parameter name and pass cannot be NULL';
    END IF;
	
    INSERT INTO users (name)
    VALUES (name, pass)
    RETURNING id into id;
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

-- ADD user review
CREATE OR REPLACE PROCEDURE addReview(
    userId INT,
    title VARCHAR,
    author VARCHAR,
    notes TEXT,
    rating INT,
    lastUpdateDate DATE,
    OUT id INT
)
LANGUAGE plpgsql
AS $$
BEGIN
	IF userId IS NULL OR newPassword IS NULL THEN
        RAISE EXCEPTION 'Both parameter userId and title cannot be NULL';
    END IF;
    
    INSERT INTO reviews (userId, title, author, notes, rating, lastUpdateDate)
    VALUES (userId, title, author, notes, rating, lastUpdateDate)
    RETURNING id into id;
END;
$$;

-- UPDATE user review
CREATE OR REPLACE PROCEDURE updateReview(
    reviewId INT,
    notes TEXT,
    rating INT,
    lastUpdateDate DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
	IF reviewId IS NULL THEN
        RAISE EXCEPTION 'Parameter reviewId cannot be NULL';
    END IF;
    
    UPDATE reviews SET notes = notes, rating = rating, lastUpdateDate = lastUpdateDate
    WHERE id = reviewId;
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
