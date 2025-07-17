create database db_project;
use db_project;

-- users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, 
    role VARCHAR(20) DEFAULT 'user'
);

INSERT INTO users (username, email, password, role) VALUES
('admin1', 'admin1@example.com', 'admin123', 'admin'),
('user1', 'user1@example.com', 'user123', 'user');

select * from users;


create table games 
(
    game_id int AUTO_INCREMENT primary key,
    game_title varchar(100) not null,
    description text,
    price int not null,
    genre varchar(50),
    platform varchar(50),
    image_url VARCHAR(255)
);

INSERT INTO games (game_title, description, price, genre, platform, image_url)
VALUES 
  ('Cyberpunk 2077', 'Open-world RPG', 5999, 'action', 'PC', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2r0f.png'),
  ('The Witcher 3', 'Fantasy RPG', 3999, 'action', 'Multi-platform', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.png'),
  ('Civilization VI', 'Strategy game', 2999, 'strategy', 'PC', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.png');

select * from games


create table orders
(
    order_id int AUTO_INCREMENT primary key,
    user_id int,
    order_date datetime default current_timestamp,
    total_amount int not null,
    status varchar(30) default 'pending',
    foreign key (user_id) references users(user_id)
	on delete set null
);

create table payments
(
    payment_id int AUTO_INCREMENT primary key,
    order_id int,
    payment_date datetime default current_timestamp,
    payment_status varchar(30) default 'pending',
    payment_method varchar(50) not null,
    foreign key (order_id) references orders(order_id)
	on delete set null
);

select * from payments;

CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    game_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase INT NOT NULL, -- Price in cents at time of purchase
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

SELECT * FROM orders; -- get user id
SELECT * FROM order_items; -- get quantity
SELECT * FROM payments; -- payment details



select * from order_items



