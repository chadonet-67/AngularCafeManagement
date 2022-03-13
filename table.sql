create table user(
    id int primary key AUTO_INCREMENT,
    name varchar(250),
    contactNumber varchar(50),
    email varchar(50),
    password varchar(250),
    status varchar(50)
    role varchar(250),
    UNIQUE(email)
);

INSERT INTO user (name,contactNumber,email,password,status,role) VALUES ('tibaut','655524554','admin@gmail','hjdkqhdye','connexter','admin');