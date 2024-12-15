import {Commit, GithubPushPayload, Repository, User} from "./model";
import SqlHelper from "./db";

export async function processWebhook(payload: GithubPushPayload) {
    try {
        // 1. Insert/update repository
        const repository: Repository = {
            repo_id: payload.repository.id,
            name: payload.repository.name,
            full_name: payload.repository.full_name,
            private: payload.repository.private,
            html_url: payload.repository.html_url,
            description: payload.repository.description,
            created_at: new Date(payload.repository.created_at * 1000),
            language: payload.repository.language,
            default_branch: payload.repository.default_branch
        };

        // Upsert repository
        await SqlHelper.executeQuery('Text', `
            MERGE Repositories AS target
            USING (SELECT 
                @repo_id as repo_id,
                @name as name,
                @full_name as full_name,
                @private as private,
                @html_url as html_url,
                @description as description,
                @created_at as created_at,
                @language as language,
                @default_branch as default_branch
            ) AS source
            ON target.repo_id = source.repo_id
            WHEN MATCHED THEN
                UPDATE SET
                    name = source.name,
                    full_name = source.full_name,
                    private = source.private,
                    html_url = source.html_url,
                    description = source.description,
                    created_at = source.created_at,
                    language = source.language,
                    default_branch = source.default_branch
            WHEN NOT MATCHED THEN
                INSERT (repo_id, name, full_name, private, html_url, description, created_at, language, default_branch)
                VALUES (source.repo_id, source.name, source.full_name, source.private, source.html_url, source.description, source.created_at, source.language, source.default_branch);
        `, [
            { name: 'repo_id', value: repository.repo_id },
            { name: 'name', value: repository.name },
            { name: 'full_name', value: repository.full_name },
            { name: 'private', value: repository.private },
            { name: 'html_url', value: repository.html_url },
            { name: 'description', value: repository.description },
            { name: 'created_at', value: repository.created_at },
            { name: 'language', value: repository.language },
            { name: 'default_branch', value: repository.default_branch }
        ]);

        // Process each commit
        for (const commit of payload.commits) {
            // Insert/update author
            const author: User = {
                username: commit.author.username,
                name: commit.author.name,
                email: commit.author.email
            };

            // Upsert author
            await SqlHelper.executeQuery('Text', `
                MERGE Users AS target
                USING (SELECT 
                    @username as username,
                    @name as name,
                    @email as email
                ) AS source
                ON target.username = source.username
                WHEN MATCHED THEN
                    UPDATE SET
                        name = source.name,
                        email = source.email
                WHEN NOT MATCHED THEN
                    INSERT (username, name, email)
                    VALUES (source.username, source.name, source.email);
            `, [
                { name: 'username', value: author.username },
                { name: 'name', value: author.name },
                { name: 'email', value: author.email }
            ]);

            // Insert/update committer (might be the same as author)
            const committer: User = {
                username: commit.committer.username,
                name: commit.committer.name,
                email: commit.committer.email
            };

            // Upsert committer
            await SqlHelper.executeQuery('Text', `
                MERGE Users AS target
                USING (SELECT 
                    @username as username,
                    @name as name,
                    @email as email
                ) AS source
                ON target.username = source.username
                WHEN MATCHED THEN
                    UPDATE SET
                        name = source.name,
                        email = source.email
                WHEN NOT MATCHED THEN
                    INSERT (username, name, email)
                    VALUES (source.username, source.name, source.email);
            `, [
                { name: 'username', value: committer.username },
                { name: 'name', value: committer.name },
                { name: 'email', value: committer.email }
            ]);

            // Insert commit
            const commitRecord: Commit = {
                commit_id: commit.id,
                repo_id: repository.repo_id,
                author_username: author.username,
                committer_username: committer.username,
                message: commit.message,
                timestamp: new Date(commit.timestamp),
                url: commit.url,
                added_files: JSON.stringify(commit.added),
                removed_files: JSON.stringify(commit.removed),
                modified_files: JSON.stringify(commit.modified)
            };

            // Insert commit (assuming we don't update commits)
            await SqlHelper.executeQuery('Text', `
                IF NOT EXISTS (SELECT 1 FROM Commits WHERE commit_id = @commit_id)
                INSERT INTO Commits (
                    commit_id, repo_id, author_username, committer_username,
                    message, timestamp, url, added_files, removed_files, modified_files
                )
                VALUES (
                    @commit_id, @repo_id, @author_username, @committer_username,
                    @message, @timestamp, @url, @added_files, @removed_files, @modified_files
                )
            `, [
                { name: 'commit_id', value: commitRecord.commit_id },
                { name: 'repo_id', value: commitRecord.repo_id },
                { name: 'author_username', value: commitRecord.author_username },
                { name: 'committer_username', value: commitRecord.committer_username },
                { name: 'message', value: commitRecord.message },
                { name: 'timestamp', value: commitRecord.timestamp },
                { name: 'url', value: commitRecord.url },
                { name: 'added_files', value: commitRecord.added_files },
                { name: 'removed_files', value: commitRecord.removed_files },
                { name: 'modified_files', value: commitRecord.modified_files }
            ]);
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        throw error;
    }
}