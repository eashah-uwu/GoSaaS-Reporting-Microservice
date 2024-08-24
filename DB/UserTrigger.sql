
-- Function for logging Insert operations (User Created)
CREATE OR REPLACE FUNCTION log_user_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO AuditTrail (IsActive, CreatedBy, ModifiedDate, Description, CreatedDate, UserID, AuditEventID)
    VALUES (
        TRUE, -- IsActive
        NEW.Name, -- CreatedBy
        CURRENT_TIMESTAMP, -- ModifiedDate
        CONCAT('User Created: ', NEW.Name, ' at ', NEW.CreatedAt), -- Description
        NEW.CreatedAt, -- CreatedDate
        NEW.UserID, -- UserID
        (SELECT ID FROM AuditEvents WHERE Event = 'User Created' AND Module = 'User') -- AuditEventID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for logging Login operations (User Logged In)
CREATE OR REPLACE FUNCTION log_user_login()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO AuditTrail (IsActive, CreatedBy, ModifiedDate, Description, CreatedDate, UserID, AuditEventID)
    VALUES (
        TRUE, -- IsActive
        NEW.Name, -- CreatedBy
        CURRENT_TIMESTAMP, -- ModifiedDate
        CONCAT('User Logged In: ', NEW.Name, ' at ', NEW."LastLoginAt"), -- Description
        NEW."LastLoginAt", -- CreatedDate
        NEW.UserID, -- UserID
        (SELECT ID FROM AuditEvents WHERE Event = 'User Logged In' AND Module = 'User') -- AuditEventID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for logging Logout operations (User Logged Out)
CREATE OR REPLACE FUNCTION log_user_logout()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO AuditTrail (IsActive, CreatedBy, ModifiedDate, Description, CreatedDate, UserID, AuditEventID)
    VALUES (
        TRUE, -- IsActive
        NEW.Name, -- CreatedBy
        CURRENT_TIMESTAMP, -- ModifiedDate
        CONCAT('User Logged Out: ', NEW.Name, ' at ', NEW."LastLogoutAt"), -- Description
        NEW."LastLogoutAt", -- CreatedDate
        NEW.UserID, -- UserID
        (SELECT ID FROM AuditEvents WHERE Event = 'User Logged Out' AND Module = 'User') -- AuditEventID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for logging Update operations (User Updated)
CREATE OR REPLACE FUNCTION log_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the update event
    INSERT INTO AuditTrail (IsActive, CreatedBy, ModifiedDate, Description, CreatedDate, UserID, AuditEventID)
    VALUES (
        TRUE, -- IsActive
        NEW.Name, -- CreatedBy
        CURRENT_TIMESTAMP, -- ModifiedDate
        CONCAT('User Updated: ', NEW.Name, ' at ', NEW.UpdatedAt), -- Description
        NEW.UpdatedAt, -- CreatedDate
        NEW.UserID, -- UserID
        (SELECT ID FROM AuditEvents WHERE Event = 'User Updated' AND Module = 'User') -- AuditEventID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
-- Trigger for user creation
CREATE TRIGGER user_insert_trigger
AFTER INSERT ON "User"
FOR EACH ROW
EXECUTE FUNCTION log_user_insert();

-- Trigger for user login
CREATE TRIGGER user_login_trigger
AFTER UPDATE ON "User"
FOR EACH ROW
WHEN (NEW."LastLoginAt" IS NOT NULL AND OLD."LastLoginAt" IS DISTINCT FROM NEW."LastLoginAt")
EXECUTE FUNCTION log_user_login();

-- Trigger for user logout
CREATE TRIGGER user_logout_trigger
AFTER UPDATE ON "User"
FOR EACH ROW
WHEN (NEW."LastLogoutAt" IS NOT NULL AND OLD."LastLogoutAt" IS DISTINCT FROM NEW."LastLogoutAt")
EXECUTE FUNCTION log_user_logout();

-- Trigger for general user updates
CREATE TRIGGER user_update_trigger
AFTER UPDATE ON "User"
FOR EACH ROW
WHEN (NEW."LastLoginAt" IS NULL AND NEW."LastLogoutAt" IS NULL AND 
      (OLD.Name IS DISTINCT FROM NEW.Name OR OLD.Email IS DISTINCT FROM NEW.Email))
EXECUTE FUNCTION log_user_update();


select * from "User" u 
-- Test SQL
-- Insert a new user to trigger the log_user_insert function
INSERT INTO "User" (Email, Name, Password)
VALUES ('testuser@example.com', 'Test User', 'password123');

-- Update the user's name to trigger the log_user_update function
UPDATE "User"
SET Name = 'Updated User', UpdatedAt = CURRENT_TIMESTAMP
WHERE Email = 'testuser@example.com';

-- Update LastLoginAt to trigger the log_user_login function
UPDATE "User"
SET "LastLoginAt" = CURRENT_TIMESTAMP
WHERE Email = 'testuser@example.com';

-- Update LastLogoutAt to trigger the log_user_logout function
UPDATE "User"
SET "LastLogoutAt" = CURRENT_TIMESTAMP
WHERE Email = 'testuser@example.com';

-- View audit trail entries
SELECT * FROM AuditTrail;
