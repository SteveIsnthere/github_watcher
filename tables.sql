-- Create Repositories table
CREATE TABLE Repositories
(
    repo_id        BIGINT PRIMARY KEY,
    name           NVARCHAR(255) NOT NULL,
    full_name      NVARCHAR(255) NOT NULL,
    private        BIT NOT NULL,
    html_url       NVARCHAR(500) NOT NULL,
    description    NVARCHAR(MAX),
    created_at     DATETIME2,
    language       NVARCHAR(100),
    default_branch NVARCHAR(100)
);

-- Create Users table (for committers/authors)
CREATE TABLE Users
(
    username NVARCHAR(255) PRIMARY KEY,
    name     NVARCHAR(255),
    email    NVARCHAR(255)
);

-- Create Commits table
CREATE TABLE Commits
(
    commit_id          NVARCHAR(40) PRIMARY KEY, -- SHA-1 hash
    repo_id            BIGINT FOREIGN KEY REFERENCES Repositories(repo_id),
    author_username    NVARCHAR(255) FOREIGN KEY REFERENCES Users(username),
    committer_username NVARCHAR(255) FOREIGN KEY REFERENCES Users(username),
    message            NVARCHAR(MAX),
    timestamp          DATETIME2,
    url                NVARCHAR(500),
    added_files        NVARCHAR(MAX),            -- JSON array of added files
    removed_files      NVARCHAR(MAX),            -- JSON array of removed files
    modified_files     NVARCHAR(MAX)             -- JSON array of modified files
);